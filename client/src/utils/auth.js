// Utility functions for authentication

/**
 * Check if user is authenticated by verifying token presence in localStorage
 * @returns {boolean} true if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Get user role from localStorage
 * @returns {string|null} User role or null if not available
 */
export const getUserRole = () => {
  return localStorage.getItem('role');
};

/**
 * Check if user has admin role
 * @returns {boolean} true if user is admin, false otherwise
 */
export const isAdmin = () => {
  const role = getUserRole();
  return role === 'admin';
};

/**
 * Get authentication token from localStorage
 * @returns {string|null} token or null if not available
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Logout user by removing authentication data from localStorage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
}; 