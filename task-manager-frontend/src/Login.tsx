import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './useAuth';
import { API_URL } from './envconstants';

function Login() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [, setAuthed] = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.status === 200) {
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
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
        {error && <div data-testid="login-error" className="mb-4 text-red-600 text-center">{error}</div>}
        {success && <div data-testid="login-success" className="mb-4 text-green-600 text-center">Login successful</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-username" className="block text-sm font-medium mb-1">Username</label>
            <input id="login-username" name="username" value={username} onChange={e => setUsername(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium mb-1">Password</label>
            <input id="login-password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition">Log In</button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don't have an account? <Link to="/signup" className="text-secondary hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login; 