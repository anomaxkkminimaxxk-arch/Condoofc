import { useState, useEffect } from 'react';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    setIsAdmin(!!token);
  }, []);

  const login = (token: string) => {
    sessionStorage.setItem('admin_token', token);
    setIsAdmin(true);
  };

  const logout = () => {
    sessionStorage.removeItem('admin_token');
    setIsAdmin(false);
  };

  return { isAdmin, login, logout };
}