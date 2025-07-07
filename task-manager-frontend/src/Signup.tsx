import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from './envconstants';

function Signup() {
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm({
    mode: 'onSubmit',
    defaultValues: { username: '', email: '', password: '' }
  });

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function onSubmit(data: { username: string; email: string; password: string }) {
    setApiError(null);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setSuccess(true);
        reset();
      } else {
        const result = await res.json();
        setApiError(result.message || 'Signup failed');
      }
    } catch (err) {
      setApiError('Network error');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl p-10">
        <h2 className="text-3xl font-bold text-center mb-8">Signup</h2>
        {success && <div data-testid="signup-success" className="mb-4 text-green-600 text-center">Signup successful</div>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="signup-username" className="block text-sm font-medium mb-1">Username</label>
            <input
              id="signup-username"
              {...register('username', { required: 'Username is required' })}
              placeholder="Username"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.username && <div data-testid="signup-error-username" className="text-red-600 text-sm">{errors.username.message as string}</div>}
          </div>
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="signup-email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                validate: (value: string) => isValidEmail(value) || 'Email is invalid'
              })}
              placeholder="Email Address"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.email && <div data-testid="signup-error-email" className="text-red-600 text-sm">{errors.email.message as string}</div>}
          </div>
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="signup-password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' }
              })}
              placeholder="Password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.password && <div data-testid="signup-error-password" className="text-red-600 text-sm">{errors.password.message as string}</div>}
          </div>
          {apiError && <div data-testid="signup-error-api" className="text-red-600 text-sm mb-2">{apiError}</div>}
          <div className="flex justify-end">
            <button type="submit" className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:opacity-90 transition">
              Sign Up
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup; 