const API_URL = 'http://localhost:8080/api';

// Track refresh token requests to prevent multiple simultaneous refreshes
let isRefreshing = false;
let refreshSubscribers = [];

// Subscribe to token refresh
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers that token refresh is complete
const onTokenRefreshed = (accessToken) => {
  refreshSubscribers.forEach(callback => callback(accessToken));
  refreshSubscribers = [];
};

// Handle retry of failed requests after token refresh
const onTokenRefreshFailed = () => {
  refreshSubscribers = [];
};

// Refresh the access token
export const refreshToken = async () => {
  const authData = getAuthData();
  if (!authData || !authData.refreshToken) {
    clearAuthData();
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: authData.refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();

    // Update stored auth data with new tokens
    const newAuthData = {
      ...authData,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
    localStorage.setItem('authData', JSON.stringify(newAuthData));

    return data.accessToken;
  } catch (error) {
    clearAuthData();
    return null;
  }
};

// Create an authenticated fetch function that handles token refresh
export const authFetch = async (url, options = {}) => {
  // Get the current auth data
  const authData = getAuthData();
  
  // If no auth data, cannot make authenticated request
  if (!authData || !authData.accessToken) {
    throw new Error('No authentication data available');
  }
  
  // Set up headers with auth token
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${authData.accessToken}`
  };
  
  // Make the request
  let response = await fetch(url, {
    ...options,
    headers
  });
  
  // If unauthorized and we have a refresh token, try to refresh
  if (response.status === 401 && authData.refreshToken) {
    // If already refreshing, wait for it to complete
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(accessToken => {
          if (accessToken) {
            // Retry the original request with new token
            headers['Authorization'] = `Bearer ${accessToken}`;
            resolve(fetch(url, { ...options, headers }));
          } else {
            reject(new Error('Failed to refresh token'));
          }
        });
      });
    }
    
    // Start refreshing
    isRefreshing = true;
    
    try {
      const newAccessToken = await refreshToken();
      
      if (newAccessToken) {
        // Notify all pending requests that token is refreshed
        onTokenRefreshed(newAccessToken);
        
        // Retry the original request with new token
        headers['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch(url, { ...options, headers });
      } else {
        // Token refresh failed
        onTokenRefreshFailed();
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      onTokenRefreshFailed();
      throw error;
    } finally {
      isRefreshing = false;
    }
  }
  
  return response;
};

// Enhanced version of getUserProfile using authFetch
export const getUserProfile = async () => {
  try {
    const response = await authFetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || data.message || 'Failed to fetch user profile');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Signup function
export const signup = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Signup failed');
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

// Login function
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Login failed');
    }
    
    // Store auth tokens in localStorage
    localStorage.setItem('authData', JSON.stringify(data));
    
    // Fetch user profile
    const userProfile = await getUserProfile();
    
    // Return combined data
    return { ...data, user: userProfile.user };
  } catch (error) {
    throw error;
  }
};

// Clear auth data from localStorage
const clearAuthData = () => {
  localStorage.removeItem('authData');
};

// Logout function (single device)
export const logout = async () => {
  try {
    const authData = getAuthData();
    if (!authData || !authData.accessToken) {
      clearAuthData();
      return;
    }
    
    const response = await authFetch(`${API_URL}/logout`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      console.error('Error during logout:', response.status);
    }
    
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    return false;
  } finally {
    // Always clear local storage even if server call fails
    clearAuthData();
  }
};

// Logout from all devices
export const logoutAll = async () => {
  try {
    const authData = getAuthData();
    if (!authData || !authData.accessToken) {
      clearAuthData();
      return;
    }
    
    const response = await authFetch(`${API_URL}/logout-all`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to logout from all devices');
    }
    
    return true;
  } catch (error) {
    console.error('Error during logout from all devices:', error);
    throw error;
  } finally {
    // Always clear local storage even if server call fails
    clearAuthData();
  }
};

// Middleware to handle API responses with token validation
export const handleApiResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Handle authentication errors
    if (response.status === 401) {
      clearAuthData();
      
      // If app needs to redirect on auth error, you can trigger an event
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    throw new Error(data.error || data.message || 'API request failed');
  }
  
  return data;
};

// Get auth data from localStorage
export const getAuthData = () => {
  const authData = localStorage.getItem('authData');
  return authData ? JSON.parse(authData) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const authData = getAuthData();
  return !!authData && !!authData.accessToken;
}; 