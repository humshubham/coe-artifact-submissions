import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../components/Signup';

describe('Signup Component', () => {
  it('renders signup page', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /signup/i })).toBeInTheDocument();
  });

  it('renders signup form fields', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows a success message after successful signup', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as jest.Mock;

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);

    expect(await screen.findByTestId('signup-success')).toBeInTheDocument();
  });

  it('shows validation errors if required fields are missing', async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    const signupButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signupButton);
    expect(await screen.findByTestId('signup-error-username')).toBeInTheDocument();
    expect(await screen.findByTestId('signup-error-email')).toBeInTheDocument();
    expect(await screen.findByTestId('signup-error-password')).toBeInTheDocument();
    expect(await screen.findByTestId('signup-error-confirm-password')).toBeInTheDocument();
  });

  it('shows validation error for short password', async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
    fireEvent.click(signupButton);
    expect(await screen.findByTestId('signup-error-password')).toHaveTextContent(
      /password must be at least 8 characters/i,
    );
  });

  it('shows validation error if passwords do not match', async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpass' } });
    fireEvent.click(signupButton);
    expect(await screen.findByTestId('signup-error-confirm-password')).toHaveTextContent(
      /passwords do not match/i,
    );
  });

  it('toggles password visibility when clicking the show/hide button', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    const passwordInput = screen.getByLabelText(/^password$/i);
    
    const eyeButtons = screen.getAllByRole('button', { name: /show password|hide password/i });
    const passwordEyeButton = eyeButtons[0];
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(passwordEyeButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    fireEvent.click(passwordEyeButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('toggles confirm password visibility when clicking the show/hide button', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const eyeButtons = screen.getAllByRole('button', { name: /show password|hide password/i });
    const confirmPasswordEyeButton = eyeButtons[1];
    
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    fireEvent.click(confirmPasswordEyeButton);
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    fireEvent.click(confirmPasswordEyeButton);
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });
});
