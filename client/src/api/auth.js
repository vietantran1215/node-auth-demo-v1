const API_URL = 'http://localhost:8080/api';

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
    const userProfile = await getUserProfile(data.accessToken);
    
    // Return combined data
    return { ...data, user: userProfile.user };
  } catch (error) {
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (accessToken) => {
  try {
    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token might be invalid or expired
        clearAuthData();
      }
      throw new Error(data.error || data.message || 'Failed to fetch user profile');
    }
    
    return data;
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
    
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.accessToken}`
      },
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
    
    const response = await fetch(`${API_URL}/logout-all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.accessToken}`
      },
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