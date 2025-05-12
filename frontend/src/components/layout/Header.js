import React, { useContext, useState, useEffect, useRef } from 'react';
import { Navbar, Container, Nav, NavDropdown, Button, Overlay, Popover } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { IMAGE_BASE_URL } from '../../config';
import NotificationDropdown from '../notifications/NotificationDropdown';
import { getUnreadCount } from '../../services/notificationService';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationTarget = useRef(null);

  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchUnreadCount = async () => {
    if (!currentUser) return;
    
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationsRead = (count) => {
    setUnreadCount(Math.max(0, unreadCount - count));
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
            <Nav.Link as={Link} to={currentUser ? `/${currentUser.username}` : "/"}>My Posts</Nav.Link>
            {currentUser && (
              <Nav.Link as={Link} to={`/${currentUser.username}/create-post`}>Create Post</Nav.Link>
            )}
          </Nav>
          <Nav>
            {currentUser ? (
              <>
                <div className="notification-container me-3">
                  <Button
                    ref={notificationTarget}
                    variant="light"
                    className="notification-btn"
                    onClick={toggleNotifications}
                  >
                    <FaBell />
                    {unreadCount > 0 && (
                      <span className="notification-indicator"></span>
                    )}
                  </Button>
                  
                  <Overlay
                    show={showNotifications}
                    target={notificationTarget.current}
                    placement="bottom-end"
                    container={document.body}
                    rootClose
                    onHide={() => setShowNotifications(false)}
                  >
                    <Popover id="notification-popover" className="notification-popover">
                      <Popover.Body className="p-0">
                        <NotificationDropdown onNotificationsRead={handleNotificationsRead} />
                      </Popover.Body>
                    </Popover>
                  </Overlay>
                </div>
                
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
