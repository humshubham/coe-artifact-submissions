import { useState, useEffect } from 'react';

export function isAuthenticated() {
  return Boolean(localStorage.getItem('access_token'));
}

export function useAuth() {
  const [authed, setAuthed] = useState(() => isAuthenticated());
  useEffect(() => {
    const handler = () => setAuthed(isAuthenticated());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);
  return [authed, setAuthed] as const;
}
