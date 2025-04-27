import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';
import axios from 'axios';

// Configure axios with interceptor for handling auth token expiration
axios.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 responses (unauthorized)
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized request detected, logging out user');
      // If we get a 401 response, the token might be expired
      // Log user out and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Set auth token header if token exists in local storage
const token = localStorage.getItem('authToken');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
