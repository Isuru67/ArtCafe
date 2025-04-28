import React, { useContext } from 'react';
import { Navbar, Container, Nav, NavDropdown, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { IMAGE_BASE_URL } from '../../config';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <span className="text-primary">Art Cafe</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {currentUser && (
              <Nav.Link as={Link} to={`/${currentUser.username}/create-post`}>Create Post</Nav.Link>
            )}
          </Nav>
          <Nav>
            {currentUser ? (
              <>
                <NavDropdown 
                  title={
                    <span>
                      {currentUser.profilePicture ? (
                        <img 
                          src={`${IMAGE_BASE_URL}${currentUser.profilePicture}`} 
                          alt={currentUser.username} 
                          className="avatar avatar-sm me-2" 
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                        />
                      ) : null}
                      {currentUser.username}
                    </span>
                  } 
                  id="user-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/profile">My Profile</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/edit-profile">Edit Profile</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/account-settings">Account Settings</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Button variant="outline-primary" className="me-2" as={Link} to="/login">
                  Login
                </Button>
                <Button variant="primary" as={Link} to="/register">
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
