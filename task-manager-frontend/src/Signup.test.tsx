import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Signup from './Signup';

describe('Signup Component', () => {
  it('renders signup page', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /signup/i })).toBeInTheDocument();
  });

  it('renders signup form fields', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows a success message after successful signup', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    }) as jest.Mock;

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);

    expect(await screen.findByTestId('signup-success')).toBeInTheDocument();
  });

  it('shows validation errors if required fields are missing', async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    const signupButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signupButton);
    expect(await screen.findByTestId('signup-error-username')).toBeInTheDocument();
    expect(await screen.findByTestId('signup-error-email')).toBeInTheDocument();
    expect(await screen.findByTestId('signup-error-password')).toBeInTheDocument();
  });

  it('shows validation error for short password', async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(signupButton);
    expect(await screen.findByTestId('signup-error-password')).toHaveTextContent(/password must be at least 8 characters/i);
  });
}); 