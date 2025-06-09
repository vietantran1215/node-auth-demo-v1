import { useState } from 'react';
import { Container, Dropdown, Nav, Navbar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, logoutAll } from '../api/auth';

function NavBar() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const handleLogoutAll = async () => {
    try {
      setIsLoggingOut(true);
      await logoutAll();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout from all devices', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
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
                      onClick={handleLogoutAll}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? 'Logging out...' : 'Logout (All Devices)'}
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
  );
}

export default NavBar; 