import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Dropdown, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAuthData, getUserProfile, logout, logoutAll } from '../api/auth';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authData = getAuthData();
        if (!authData || !authData.accessToken) {
          setError('Authentication data not found');
          setLoading(false);
          return;
        }
        
        // If user data is already in authData, use it
        if (authData.user) {
          setUser(authData.user);
          setLoading(false);
          return;
        }
        
        // Otherwise, fetch user profile
        const profileData = await getUserProfile(authData.accessToken);
        setUser(profileData.user);
      } catch (error) {
        setError('Failed to load user data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to logout: ' + error.message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      setIsLoggingOut(true);
      await logoutAll();
      navigate('/login');
    } catch (error) {
      setError('Failed to logout from all devices: ' + error.message);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header as="h4" className="text-center">Dashboard</Card.Header>
            <Card.Body>
              <h2 className="text-center mb-4">Welcome to Your Dashboard!</h2>
              
              {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-2">Loading your profile...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : user ? (
                <div className="text-center">
                  <p className="mb-1">
                    <strong>Username:</strong> {user.username || 'N/A'}
                  </p>
                  {user.name && (
                    <p className="mb-1">
                      <strong>Name:</strong> {user.name}
                    </p>
                  )}
                  {user.email && (
                    <p className="mb-1">
                      <strong>Email:</strong> {user.email}
                    </p>
                  )}
                </div>
              ) : (
                <Alert variant="warning">No user data available</Alert>
              )}
              
              <hr />
              
              <div className="text-center mt-4">
                <p>You have successfully logged in to the secure area!</p>
                <p className="text-muted">This is a protected route that only authenticated users can access.</p>
                
                <div className="d-flex justify-content-center mt-4">
                  <Dropdown>
                    <Dropdown.Toggle variant="danger" id="dropdown-logout" disabled={isLoggingOut}>
                      {isLoggingOut ? 'Logging out...' : 'Logout Options'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? 'Logging out...' : 'Logout (This Device)'}
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={handleLogoutAll}
                        disabled={isLoggingOut}
                      >
                        Logout (All Devices)
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard; 