import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../utils/envconstants';

function Login() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit } = useForm({
    mode: 'onSubmit',
    defaultValues: { username: '', password: '' },
  });
  const [, setAuthed] = useAuth();
  const navigate = useNavigate();

  async function onSubmit(data: { username: string; password: string }) {
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.status === 200) {
        const dataRes = await res.json();
        if (dataRes.access_token) {
          localStorage.setItem('access_token', dataRes.access_token);
          setSuccess(true);
          setAuthed(true);
          navigate('/tasks');
        } else {
          setError('Invalid credentials');
        }
      } else if (res.status === 401) {
        setError('Invalid credentials');
      } else {
        setError('Network error');
      }
    } catch (err) {
      setError('Network error');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center text-primary">Login</h2>
        {error && (
          <div data-testid="login-error" className="mb-4 text-red-600 text-center">
            {error}
          </div>
        )}
        {success && (
          <div data-testid="login-success" className="mb-4 text-green-600 text-center">
            Login successful
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="login-username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              id="login-username"
              {...register('username')}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              {...register('password')}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition"
          >
            Log In
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-secondary hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
