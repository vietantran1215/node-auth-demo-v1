import { useState } from 'react';
import { Container, Dropdown, Modal, Button, Nav, Navbar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, logoutAll } from '../api/auth';

function NavBar() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
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
      console.error('Failed to logout from all devices:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCloseModal = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Auth Demo</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {authenticated ? (
                <>
                  <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="dark" id="dropdown-logout">
                      Account
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item as={Link} to="/dashboard">Profile</Dropdown.Item>
                      <Dropdown.Divider />
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
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

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
    </>
  );
}

export default NavBar; 