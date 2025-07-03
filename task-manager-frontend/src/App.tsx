import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Home() {
  return <div><h2>Home</h2></div>;
}

function Tasks() {
  return <div><h2>Task List</h2></div>;
}

function Profile() {
  return <div><h2>User Profile</h2></div>;
}

function useAuth() {
  const [authed, setAuthed] = useState(() => isAuthenticated());
  useEffect(() => {
    const handler = () => setAuthed(isAuthenticated());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);
  return [authed, setAuthed] as const;
}

function Login() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [, setAuthed] = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('http://127.0.0.1:5000/login', {
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
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        {success && <div className="mb-4 text-green-600 text-center">Login successful</div>}
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

function Signup() {
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{username?: string; email?: string; password?: string}>({});
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!username) newErrors.username = 'Username is required';
    if (!email) newErrors.email = 'Email is required';
    else if (email && !isValidEmail(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password && password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    setApiError(null);
    if (Object.keys(newErrors).length === 0) {
      try {
        const res = await fetch('http://127.0.0.1:5000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        if (res.ok) {
          setSuccess(true);
        } else {
          const data = await res.json();
          setApiError(data.message || 'Signup failed');
        }
      } catch (err) {
        setApiError('Network error');
      }
    } else {
      setSuccess(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center text-primary">Signup</h2>
        {success ? (
          <div className="text-green-600 text-center">Signup successful</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="signup-username" className="block text-sm font-medium mb-1">Username</label>
              <input
                id="signup-username"
                name="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.username && <div data-testid="signup-error-username" className="text-red-600 text-xs mt-1">{errors.username}</div>}
            </div>
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium mb-1">Email</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.email && <div data-testid="signup-error-email" className="text-red-600 text-xs mt-1">{errors.email}</div>}
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium mb-1">Password</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.password && <div data-testid="signup-error-password" className="text-red-600 text-xs mt-1">{errors.password}</div>}
            </div>
            {apiError && <div data-testid="signup-error-api" className="text-red-600 text-center">{apiError}</div>}
            <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition">Sign Up</button>
          </form>
        )}
        <div className="mt-4 text-center text-sm">
          Already have an account? <Link to="/login" className="text-secondary hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}

function isAuthenticated() {
  // Minimal: check for token in localStorage
  return Boolean(localStorage.getItem('access_token'));
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  const [authed, setAuthed] = useAuth();

  function handleLogout() {
    localStorage.removeItem('access_token');
    setAuthed(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-red-400">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-primary text-center">Task Manager</h1>
        <nav className="mb-4 flex flex-col md:flex-row md:space-x-4 justify-center items-center">
          <ul className="flex flex-col md:flex-row md:space-x-4 items-center">
            <li><Link to="/" className="text-secondary hover:underline">Home</Link></li>
            <li><Link to="/tasks" className="text-secondary hover:underline">Tasks</Link></li>
            <li><Link to="/profile" className="text-secondary hover:underline">Profile</Link></li>
            {!authed && <li><Link to="/login" className="text-secondary hover:underline">Login</Link></li>}
            {!authed && <li><Link to="/signup" className="text-secondary hover:underline">Sign Up</Link></li>}
            {authed && <li><button onClick={handleLogout} className="ml-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Logout</button></li>}
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<RequireAuth><Tasks /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
