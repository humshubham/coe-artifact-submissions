import { render, screen, waitFor } from '@testing-library/react';
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
    it('navigates to tasks page when clicking Tasks link', async () => {
      renderWithRouter();
      const user = userEvent.setup();
      
      await user.click(screen.getByRole('link', { name: /tasks/i }));
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /task list/i })).toBeInTheDocument();
      });
    });

    it('navigates to profile page when clicking Profile link', async () => {
      renderWithRouter();
      const user = userEvent.setup();
      
      await user.click(screen.getByRole('link', { name: /profile/i }));
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /user profile/i })).toBeInTheDocument();
      });
    });

    it('navigates to home page when clicking Home link', async () => {
      renderWithRouter('/tasks'); // Start from tasks page
      const user = userEvent.setup();
      
      await user.click(screen.getByRole('link', { name: /home/i }));
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument();
      });
    });

    it('shows a success message after successful signup', async () => {
      renderWithRouter('/signup');
      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/username/i), 'newuser');
      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));
      // Simulate API and check for success message
      expect(await screen.findByText(/signup successful/i)).toBeInTheDocument();
    });

    it('shows validation errors if required fields are missing', async () => {
      renderWithRouter('/signup');
      const user = userEvent.setup();
      // Submit with all fields empty
      await user.click(screen.getByRole('button', { name: /sign up/i }));
      expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
      expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
      expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    });

    it('shows validation error for invalid email and short password', async () => {
      renderWithRouter('/signup');
      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/username/i), 'newuser');
      await user.type(screen.getByLabelText(/email/i), 'not-an-email');
      await user.type(screen.getByLabelText(/password/i), 'short');
      await user.click(screen.getByRole('button', { name: /sign up/i }));
      expect(await screen.findByTestId('signup-error-email')).toHaveTextContent(/email is invalid/i);
      expect(await screen.findByTestId('signup-error-password')).toHaveTextContent(/password must be at least 8 characters/i);
    });

    it('shows an error message for invalid login credentials', async () => {
      renderWithRouter('/login');
      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/username/i), 'wronguser');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /log in/i }));
      expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
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
}); 