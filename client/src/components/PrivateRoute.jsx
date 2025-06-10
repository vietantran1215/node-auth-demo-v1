import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, refreshToken } from '../api/auth';

function PrivateRoute() {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // First check if user is authenticated based on stored tokens
      if (isAuthenticated()) {
        setIsAuth(true);
        setLoading(false);
        return;
      }

      try {
        // Try to refresh the token if authentication failed
        const newToken = await refreshToken();
        
        // If refresh token succeeded, user is authenticated
        setIsAuth(!!newToken);
      } catch (error) {
        // If refresh token failed, user is not authenticated
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // While checking auth status, show nothing (or you could add a loading spinner)
  if (loading) {
    return null;
  }

  // Once auth check is complete, either show the protected route or redirect to login
  return isAuth ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoute; 