import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../api/auth';

function PrivateRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoute; 