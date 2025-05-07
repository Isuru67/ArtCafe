import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Button, Spinner, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaEnvelope, FaUser } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { IMAGE_BASE_URL } from '../../config';

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
    // Reset image error when user changes
    setImageError(false);
  }, [currentUser, navigate]);

  if (!currentUser) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Safe access to user properties with fallbacks
  const username = currentUser.username || 'User';
  const fullName = currentUser.fullName || username;
  const email = currentUser.email || '';
  const bio = currentUser.bio || 'No bio yet';

  // Determine the image source with safety checks
  const getProfileImageSrc = () => {
    if (imageError || !currentUser.profilePicture) {
      return 'https://via.placeholder.com/150';
    }
    return `${IMAGE_BASE_URL}${currentUser.profilePicture}`;
  };

  const handleImageError = () => {
    console.log("Image failed to load, using placeholder");
    setImageError(true);
  };

  return (
    <div className="profile-page">
      {/* Hero section with gradient background */}
      <div className="profile-header py-5" style={{
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        color: 'white',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col md={4} className="text-center mb-4 mb-md-0">
              <div className="position-relative d-inline-block">
                <img 
                  src={getProfileImageSrc()}
                  alt={username}
                  className="profile-avatar rounded-circle"
                  style={{ 
                    width: '200px', 
                    height: '200px', 
                    objectFit: 'cover',
                    border: '5px solid white',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                  }}
                  onError={handleImageError}
                />
              </div>
            </Col>
            <Col md={8}>
              <div className="profile-info">
                <h1 className="display-5 fw-bold mb-1">{fullName}</h1>
                <p className="lead mb-2 text-light">@{username}</p>
                <p className="d-flex align-items-center mb-3">
                  <FaEnvelope className="me-2" /> {email}
                </p>
                
                <Button as={Link} to="/edit-profile" variant="light" className="mt-2 px-4">
                  <FaEdit className="me-2" /> Edit Profile
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      
      {/* Profile details section */}
      <Container className="py-5">
        <Row>
          <Col lg={8}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h4 className="mb-0">About</h4>
              </Card.Header>
              <Card.Body>
                {bio === 'No bio yet' ? (
                  <div className="text-center py-4">
                    <FaUser className="mb-3" style={{ fontSize: '2rem', opacity: 0.3 }} />
                    <p className="text-muted mb-0">
                      No bio yet. <Link to="/edit-profile">Add a bio</Link> to tell others about yourself.
                    </p>
                  </div>
                ) : (
                  <p className="mb-0" style={{ lineHeight: '1.7' }}>{bio}</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h4 className="mb-0">Profile Info</h4>
              </Card.Header>
              <Card.Body>
                <div className="profile-stats">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Joined</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Role</span>
                    <span>Artist</span>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Status</span>
                    <span className="text-success">Active</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;
