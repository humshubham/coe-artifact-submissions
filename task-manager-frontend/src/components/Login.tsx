import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../utils/envconstants';
import { apiFetch } from '../utils/apiFetch';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await apiFetch(`${API_URL}/login`, {
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
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">Login</h2>
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
              placeholder="Username"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:opacity-90 transition"
            >
              Log In
            </button>
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent hover:underline hover:brightness-125 transition"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
