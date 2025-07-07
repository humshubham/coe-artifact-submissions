import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Tasks from './Tasks';
import Login from './Login';
import Signup from './Signup';
import { useAuth, isAuthenticated } from './useAuth';

function Home() {
  if (isAuthenticated()) {
    return <Navigate to="/tasks" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
}

function Profile() {
  return <div><h2>User Profile</h2></div>;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-red-400 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8 text-white drop-shadow-lg text-center">Task Manager</h1>
      <div className="w-full flex-1 flex flex-col items-center justify-center">
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
