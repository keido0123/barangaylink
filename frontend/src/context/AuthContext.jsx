import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';

// FILE: frontend/src/context/AuthContext.jsx

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const savedAdmin = localStorage.getItem('admin');
      const savedUser = localStorage.getItem('user');

      if (!token) { setLoading(false); return; }

      if (savedAdmin && savedAdmin !== 'undefined' && savedAdmin !== 'null') {
        const parsedAdmin = JSON.parse(savedAdmin);
        if (parsedAdmin?.id) {
          setAdmin(parsedAdmin);
          setUser(null);
          setLoading(false);
          return;
        }
      }

      if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser?.id) {
          setUser(parsedUser);
          setAdmin(null);
        }
      }
    } catch (e) {
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  const loginUser = async (email, password) => {
    const res = await api.post('/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.removeItem('admin');
    setUser(res.data.user);
    setAdmin(null);
    return res.data;
  };

  /**
   * registerUser accepts either a plain object or a FormData instance
   * (FormData is required when uploading the ID document image).
   */
  const registerUser = async (payload) => {
    const isFormData = payload instanceof FormData;
    const res = await api.post('/register', payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
    });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.removeItem('admin');
    setUser(res.data.user);
    setAdmin(null);
    return res.data;
  };

  const loginAdmin = async (email, password) => {
    const res = await api.post('/admin/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('admin', JSON.stringify(res.data.admin));
    localStorage.removeItem('user');
    setAdmin(res.data.admin);
    setUser(null);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post(admin ? '/admin/logout' : '/logout');
    } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    setUser(null);
    setAdmin(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, admin, loginUser, registerUser, loginAdmin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);