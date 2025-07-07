import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Tasks from './Tasks';
import Login from './components/Login';
import Signup from './components/Signup';
import { isAuthenticated } from './hooks/useAuth';

function Home() {
  if (isAuthenticated()) {
    return <Navigate to="/tasks" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
}

function Profile() {
  return (
    <div>
      <h2>User Profile</h2>
    </div>
  );
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
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/tasks"
            element={
              <RequireAuth>
                <Tasks />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
