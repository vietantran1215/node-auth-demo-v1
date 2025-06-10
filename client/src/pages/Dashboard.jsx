import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Dropdown, Modal, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAuthData, getUserProfile, logout, logoutAll } from '../api/auth';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if we have auth data
        const authData = getAuthData();
        if (!authData) {
          navigate('/login');
          return;
        }

        setLoading(true);

        // Fetch user profile using the enhanced getUserProfile with token refresh
        const profileData = await getUserProfile();
        setUser(profileData.user);
        setError('');
      } catch (error) {
        console.error('Failed to load user data:', error);

        // If the error is authentication related, redirect to login
        if (error.message.includes('authentication') || error.message.includes('token')) {
          navigate('/login');
        } else {
          setError('Failed to load user data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Listen for auth expiration events
    const handleAuthExpired = () => {
      navigate('/login');
    };

    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [navigate]);

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

  const handleConfirmLogoutAll = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutAll = async () => {
    try {
      setIsLoggingOut(true);
      setShowLogoutModal(false);
      await logoutAll();
      navigate('/login');
    } catch (error) {
      setError('Failed to logout from all devices: ' + error.message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCloseModal = () => {
    setShowLogoutModal(false);
  };

  const handleRetry = () => {
    setError('');
    setLoading(true);

    // Re-fetch user data
    getUserProfile()
      .then(profileData => {
        setUser(profileData.user);
      })
      .catch(error => {
        console.error('Failed to load user data on retry:', error);
        setError('Failed to load user data. Please try again.');

        // If the error is authentication related, redirect to login
        if (error.message.includes('authentication') || error.message.includes('token')) {
          navigate('/login');
        }
      })
      .finally(() => {
        setLoading(false);
      });
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
                <div className="text-center">
                  <Alert variant="danger">{error}</Alert>
                  <Button variant="primary" onClick={handleRetry} className="mt-2">
                    Retry
                  </Button>
                </div>
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
                        onClick={handleConfirmLogoutAll}
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

      {/* Logout confirmation modal */}
      <Modal show={showLogoutModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to log out from <strong>all devices</strong>?</p>
          <p>This will terminate all active sessions for your account.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleLogoutAll}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout from All Devices'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Dashboard; 