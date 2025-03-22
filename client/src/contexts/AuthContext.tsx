import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  userId: string | null;
  loading: boolean;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  userId: null,
  loading: false,
  isAuthenticated: () => false,
  isAdmin: () => false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  checkAuth: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Verifica il token all'avvio
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Imposta il token nelle richieste Axios
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Ottieni i dati dell'utente dal localStorage
          const storedUserData = localStorage.getItem('userData');
          if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            setUser(userData);
            setToken(storedToken);
            setUserId(userData.id);
          }
        } catch (error) {
          console.error('Errore nella verifica del token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          setUser(null);
          setToken(null);
          setUserId(null);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!token && !!user;
  }, [token, user]);

  const isAdmin = useCallback(() => {
    return isAuthenticated() && user?.role === 'ADMIN';
  }, [isAuthenticated, user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email,
        password
      });
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('userData', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      setUserId(userData.id);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Errore durante il login:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register', {
        name,
        email,
        password
      });
      
      return response.data;
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setToken(null);
    setUser(null);
    setUserId(null);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const checkAuth = useCallback(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');
    
    if (storedToken && storedUserData) {
      const userData = JSON.parse(storedUserData);
      setToken(storedToken);
      setUser(userData);
      setUserId(userData.id);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    } else {
      setToken(null);
      setUser(null);
      setUserId(null);
    }
    setLoading(false);
  }, []);

  const value = {
    user,
    token,
    userId,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 