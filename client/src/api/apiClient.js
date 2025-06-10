import { authFetch, getAuthData } from './auth';

// Base API URL
const API_URL = 'http://localhost:8080/api';

// API Client with automatic token refresh
export const apiClient = {
  /**
   * Make a GET request to the API
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - Response data
   */
  async get(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const response = await authFetch(url, {
      method: 'GET',
      ...options,
    });
    
    return handleResponse(response);
  },
  
  /**
   * Make a POST request to the API
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - Response data
   */
  async post(endpoint, data = {}, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const response = await authFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });
    
    return handleResponse(response);
  },
  
  /**
   * Make a PUT request to the API
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - Response data
   */
  async put(endpoint, data = {}, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const response = await authFetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });
    
    return handleResponse(response);
  },
  
  /**
   * Make a DELETE request to the API
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - Response data
   */
  async delete(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const response = await authFetch(url, {
      method: 'DELETE',
      ...options,
    });
    
    return handleResponse(response);
  },
  
  /**
   * Get the current auth user data
   * @returns {Object|null} - Auth user data or null if not authenticated
   */
  getUser() {
    const authData = getAuthData();
    return authData?.user || null;
  },
  
  /**
   * Get the base API URL
   * @returns {string} - Base API URL
   */
  getBaseUrl() {
    return API_URL;
  }
};

/**
 * Handle API response
 * @param {Response} response - Fetch response object
 * @returns {Promise<any>} - Response data
 */
async function handleResponse(response) {
  // For empty responses or 204 No Content
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }
  
  // Try to parse as JSON
  let data;
  try {
    data = await response.json();
  } catch (error) {
    // If not JSON, return text
    return await response.text();
  }
  
  // Check if response is successful
  if (!response.ok) {
    const error = new Error(data.error || data.message || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
} 