import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URLS } from '../config';
import { registerUser, loginUser } from '../services/userService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check if user is logged in on app startup
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setCurrentUser(JSON.parse(userData));
      // Set axios default header for auth
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = async (usernameOrEmail, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // Use the imported loginUser function
      const userData = await loginUser(usernameOrEmail, password);
      
      // The API returns token and user data combined
      const { token, ...userInfo } = userData;
      
      // Save auth info to local storage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      // Set user in context
      setCurrentUser(userInfo);
      
      // Set default auth header for future API calls
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return userInfo;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const response = await registerUser(userData);
      
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  // Update user profile in context after profile changes
  const updateUserInContext = (updatedUser) => {
    const newUserData = { ...currentUser, ...updatedUser };
    setCurrentUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  // Provide auth context to entire app
  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      authError, 
      login, 
      register, 
      logout,
      updateUserInContext 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
