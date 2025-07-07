import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import App from './App';

const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </MemoryRouter>
  );
};

describe('App Component', () => {
  describe('Navigation', () => {
    it('renders the app title', () => {
      renderWithRouter();
      expect(screen.getByRole('heading', { name: /task manager/i })).toBeInTheDocument();
    });
  });

  describe('Routing', () => {
    it('renders home page by default', () => {
      renderWithRouter();
      expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument();
    });

    it('renders login page when navigating to /login', () => {
      renderWithRouter('/login');
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('renders signup page when navigating to /signup', () => {
      renderWithRouter('/signup');
      expect(screen.getByRole('heading', { name: /signup/i })).toBeInTheDocument();
    });

    it('renders signup form fields', () => {
      renderWithRouter('/signup');
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });
  });

  describe('Navigation Interaction', () => {
    it('shows a success message after successful signup', async () => {
      // Mock fetch to simulate a successful signup response
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({})
      }) as jest.Mock;
      
      renderWithRouter('/signup');
      const user = userEvent.setup();
      
      await act(async () => {
        await user.type(screen.getByLabelText(/username/i), 'newuser');
        await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /sign up/i }));
      });
      
      expect(await screen.findByTestId('signup-success')).toBeInTheDocument();
    });

    it('shows validation errors if required fields are missing', async () => {
      renderWithRouter('/signup');
      const user = userEvent.setup();
      
      await act(async () => {
        // Submit with all fields empty
        await user.click(screen.getByRole('button', { name: /sign up/i }));
      });
      
      expect(await screen.findByTestId('signup-error-username')).toBeInTheDocument();
      expect(await screen.findByTestId('signup-error-email')).toBeInTheDocument();
      expect(await screen.findByTestId('signup-error-password')).toBeInTheDocument();
    });

    // it('shows validation error for invalid email and short password', async () => {
    //   renderWithRouter('/signup');
    //   const user = userEvent.setup();
    //   await user.type(screen.getByLabelText(/username/i), 'newuser');
    //   await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    //   await user.type(screen.getByLabelText(/password/i), 'short');
    //   await user.click(screen.getByRole('button', { name: /sign up/i }));
    //   expect(await screen.findByTestId('signup-error-email')).toHaveTextContent(/email is invalid/i);
    //   expect(await screen.findByTestId('signup-error-password')).toHaveTextContent(/password must be at least 8 characters/i);
    // });

    it('shows an error message for invalid login credentials', async () => {
      // Mock fetch to simulate a failed login response
      global.fetch = jest.fn().mockResolvedValue({
        status: 401,
        ok: false
      }) as jest.Mock;
      
      renderWithRouter('/login');
      const user = userEvent.setup();
      
      await act(async () => {
        await user.type(screen.getByLabelText(/username/i), 'wronguser');
        await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /log in/i }));
      });
      
      expect(await screen.findByTestId('login-error')).toBeInTheDocument();
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
      global.fetch && (global.fetch as jest.Mock).mockClear && (global.fetch as jest.Mock).mockClear();
    });
    
    it('fetches and displays tasks for the logged-in user', async () => {
      const mockTasks = [
        { id: 1, title: 'Test Task 1', description: 'Desc 1', status: 'pending' },
        { id: 2, title: 'Test Task 2', description: 'Desc 2', status: 'completed' }
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
            has_prev: false
          } 
        })
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
}); 