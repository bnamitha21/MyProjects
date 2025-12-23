import { createContext, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import i18n, {
  LANGUAGE_PREFERENCE_TO_CODE,
  LANGUAGE_CODE_TO_PREFERENCE
} from '../i18n/config';
import { logBehaviorEvent } from '../utils/behaviorTracker';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const FALLBACK_LANGUAGE_CODE = 'en';

  const persistLanguageCode = (code) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', code);
    }
  };

  const changeLanguageByCode = (code) => {
    const normalizedCode = LANGUAGE_CODE_TO_PREFERENCE[code] ? code : FALLBACK_LANGUAGE_CODE;
    i18n.changeLanguage(normalizedCode);
    persistLanguageCode(normalizedCode);
    return LANGUAGE_CODE_TO_PREFERENCE[normalizedCode];
  };

  const changeLanguageByPreference = (preference) => {
    const code = LANGUAGE_PREFERENCE_TO_CODE[preference] || FALLBACK_LANGUAGE_CODE;
    i18n.changeLanguage(code);
    persistLanguageCode(code);
  };

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Get user data (token is automatically added by interceptor)
          const res = await api.get('/auth/me');
          setUser(res.data);
          if (res.data?.preferredLanguage) {
            changeLanguageByPreference(res.data.preferredLanguage);
          }
        }
      } catch (err) {
        // Clear invalid token
        localStorage.removeItem('token');
        console.error('Authentication error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.post('/auth/register', userData);
      
      // Save token
      localStorage.setItem('token', res.data.token);
      
      setUser(res.data);
      if (res.data?.preferredLanguage) {
        changeLanguageByPreference(res.data.preferredLanguage);
      }
      logBehaviorEvent('app_login', { method: 'register' });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.post('/auth/login', { email, password });
      
      // Save token
      localStorage.setItem('token', res.data.token);
      
      setUser(res.data);
      if (res.data?.preferredLanguage) {
        changeLanguageByPreference(res.data.preferredLanguage);
      }
      logBehaviorEvent('app_login', { method: 'credential' });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    logBehaviorEvent('app_logout', { method: 'manual' })
      .catch(() => null)
      .finally(() => {
        localStorage.removeItem('token');
        setUser(null);
        changeLanguageByPreference('english');
      });
  };

  const updateLanguagePreference = async (languageCode) => {
    const previousCode = i18n.language;
    const normalizedCode = LANGUAGE_CODE_TO_PREFERENCE[languageCode]
      ? languageCode
      : FALLBACK_LANGUAGE_CODE;
    const preference = LANGUAGE_CODE_TO_PREFERENCE[normalizedCode];
    changeLanguageByCode(normalizedCode);

    try {
      if (user) {
        await api.put('/auth/preferences/language', {
          preferredLanguage: preference,
        });
        setUser((prev) => prev ? { ...prev, preferredLanguage: preference } : prev);
      }
    } catch (err) {
      changeLanguageByCode(previousCode);
      throw err;
    }
  };

  useEffect(() => {
    if (user?.preferredLanguage) {
      changeLanguageByPreference(user.preferredLanguage);
    }
  }, [user?.preferredLanguage]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateLanguagePreference,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};