import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Check expiry
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
            return;
          }

          // Fetch fresh user data
          const res = await api.get('/auth/me');
          console.log("AuthContext loaded user:", res.data); // DEBUG LOG
          setUser(res.data);
        } catch (error) {
          console.error('Error loading user', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    console.log("AuthContext login response:", res.data); // DEBUG LOG
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const checkPermission = (resource, action) => {
    if (!user || !user.role) return false;

    // Admin Override
    if (user.role.name === 'Admin') return true;

    // Check specific permission
    return user.role.permissions?.[resource]?.[action] === true;
  };

  const isAdmin = user?.role?.name === 'Admin';
  console.log("AuthContext isAdmin:", isAdmin, "Role:", user?.role);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin,
    can: checkPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
