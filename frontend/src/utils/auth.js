/**
 * Get the authentication headers for making API requests
 * This includes the JWT token from localStorage
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

/**
 * Set authentication token in localStorage
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

/**
 * Remove authentication token from localStorage
 */
export const clearAuthToken = () => {
  localStorage.removeItem('token');
};

/**
 * Check if user is authenticated (has token)
 */
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};
