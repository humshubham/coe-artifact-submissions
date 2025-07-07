import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter
      initialEntries={[initialRoute]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>,
  );
};

describe('App Component', () => {
  describe('Navigation', () => {
    it('renders the app title', () => {
      renderWithRouter();
      expect(screen.getByRole('heading', { name: /task manager/i })).toBeInTheDocument();
    });
  });

  describe('Authentication gating', () => {
    it('redirects to login if not authenticated when accessing /tasks', async () => {
      renderWithRouter('/tasks');
      // Should see login page, not tasks
      expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /task list/i })).not.toBeInTheDocument();
    });

    it('redirects to login if not authenticated when accessing /profile', async () => {
      renderWithRouter('/profile');
      // Should see login page, not profile
      expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /user profile/i })).not.toBeInTheDocument();
    });
  });

  describe('Tasks API integration', () => {
    beforeEach(() => {
      // Mock localStorage to simulate authentication
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => {
        if (key === 'access_token') return 'mocked-jwt-token';
        return null;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
      global.fetch &&
        (global.fetch as jest.Mock).mockClear &&
        (global.fetch as jest.Mock).mockClear();
    });

    it('fetches and displays tasks for the logged-in user', async () => {
      const mockTasks = [
        { id: 1, title: 'Test Task 1', description: 'Desc 1', status: 'pending' },
        { id: 2, title: 'Test Task 2', description: 'Desc 2', status: 'completed' },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          tasks: mockTasks,
          pagination: {
            page_no: 1,
            total: 2,
            total_pages: 1,
            has_next: false,
            has_prev: false,
          },
        }),
      }) as jest.Mock;

      renderWithRouter('/tasks');

      // Should show loading initially
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Wait for tasks to appear
      for (const task of mockTasks) {
        expect(await screen.findByText(task.title)).toBeInTheDocument();
        expect(screen.getByText(task.description)).toBeInTheDocument();
      }
    });
  });

  describe('Root URL redirect', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('redirects to /login if not authenticated when visiting /', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(() => null);
      renderWithRouter('/');
      // Should see login page after redirect
      expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('redirects to /tasks if authenticated when visiting /', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => {
        if (key === 'access_token') return 'mocked-jwt-token';
        return null;
      });
      // Mock fetch for tasks page
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          tasks: [],
          pagination: { page_no: 1, total: 0, total_pages: 1, has_next: false, has_prev: false },
        }),
      }) as jest.Mock;
      renderWithRouter('/');
      // Should see tasks page after redirect
      expect(await screen.findByTestId('tasks-title')).toBeInTheDocument();
    });
  });
});
