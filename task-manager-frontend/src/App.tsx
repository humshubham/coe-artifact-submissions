import { Routes, Route, Link } from 'react-router-dom';

function Home() {
  return <div><h2>Home</h2></div>;
}

function Tasks() {
  return <div><h2>Task List</h2></div>;
}

function Profile() {
  return <div><h2>User Profile</h2></div>;
}

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-primary">Task Manager</h1>
      <nav className="mb-4">
        <ul className="flex flex-col md:flex-row md:space-x-4">
          <li><Link to="/" className="text-secondary hover:underline">Home</Link></li>
          <li><Link to="/tasks" className="text-secondary hover:underline">Tasks</Link></li>
          <li><Link to="/profile" className="text-secondary hover:underline">Profile</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;
