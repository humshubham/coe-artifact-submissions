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
    <div>
      <h1>Task Manager</h1>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/tasks">Tasks</Link></li>
          <li><Link to="/profile">Profile</Link></li>
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
