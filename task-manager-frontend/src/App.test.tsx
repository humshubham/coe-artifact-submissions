import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import App from './App';

const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
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

    it('renders all navigation links', () => {
      renderWithRouter();
      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /tasks/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    });
  });

  describe('Routing', () => {
    it('renders home page by default', () => {
      renderWithRouter();
      expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument();
    });

    it('renders tasks page when navigating to /tasks', () => {
      renderWithRouter('/tasks');
      expect(screen.getByRole('heading', { name: /task list/i })).toBeInTheDocument();
    });

    it('renders profile page when navigating to /profile', () => {
      renderWithRouter('/profile');
      expect(screen.getByRole('heading', { name: /user profile/i })).toBeInTheDocument();
    });
  });

  describe('Navigation Interaction', () => {
    it('navigates to tasks page when clicking Tasks link', async () => {
      renderWithRouter();
      const user = userEvent.setup();
      
      await user.click(screen.getByRole('link', { name: /tasks/i }));
      expect(screen.getByRole('heading', { name: /task list/i })).toBeInTheDocument();
    });

    it('navigates to profile page when clicking Profile link', async () => {
      renderWithRouter();
      const user = userEvent.setup();
      
      await user.click(screen.getByRole('link', { name: /profile/i }));
      expect(screen.getByRole('heading', { name: /user profile/i })).toBeInTheDocument();
    });

    it('navigates to home page when clicking Home link', async () => {
      renderWithRouter('/tasks'); // Start from tasks page
      const user = userEvent.setup();
      
      await user.click(screen.getByRole('link', { name: /home/i }));
      expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument();
    });
  });
}); 