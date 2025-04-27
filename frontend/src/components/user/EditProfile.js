import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { FaUpload, FaCog } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile, uploadProfilePicture } from '../../services/userService';
import { IMAGE_BASE_URL } from '../../config';

const EditProfile = () => {
  const { currentUser, updateUserInContext } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    bio: ''
  });
  
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    fetchUserProfile();
  }, [currentUser]);
  
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await getUserProfile();
      
      setProfileData({
        fullName: userData.fullName || '',
        bio: userData.bio || ''
      });
      
      if (userData.profilePicture) {
        setPreviewUrl(`${IMAGE_BASE_URL}${userData.profilePicture}`);
      }
      
      setLoading(false);
    } catch (error) {
      setError('Failed to load user profile.');
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }
    
    setProfilePicture(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };
  
  const handlePictureUpload = async () => {
    if (!profilePicture) return;
    
    try {
      setUploading(true);
      setError('');
      
      const response = await uploadProfilePicture(profilePicture);
      
      // Update the user in context
      updateUserInContext({ profilePicture: response.profilePicture });
      
      setSuccessMessage('Profile picture updated successfully!');
      setUploading(false);
    } catch (error) {
      setError('Failed to upload profile picture. Please try again.');
      setUploading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      const updatedProfile = await updateUserProfile(profileData);
      
      // Update the user in context
      updateUserInContext(updatedProfile);
      
      setSuccessMessage('Profile updated successfully!');
      setSaving(false);
      
      // Scroll to top to show the success message
      window.scrollTo(0, 0);
    } catch (error) {
      setError('Failed to update profile. Please try again.');
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Edit Profile</h2>
            <Button as={Link} to="/account-settings" variant="outline-secondary">
              <FaCog className="me-2" />
              Account Settings
            </Button>
          </div>
          
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">Your Profile Information</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              {successMessage && <Alert variant="success">{successMessage}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row className="mb-4">
                  <Col md={4} className="d-flex flex-column align-items-center">
                    <div className="position-relative mb-3">
                      <img 
                        src={previewUrl || 'https://via.placeholder.com/150'} 
                        alt="Profile" 
                        className="rounded-circle img-thumbnail"
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                      />
                    </div>
                    
                    <div className="d-grid gap-2">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handlePictureChange}
                        className="mb-2"
                      />
                      <Button
                        variant="secondary"
                        onClick={handlePictureUpload}
                        disabled={!profilePicture || uploading}
                        size="sm"
                      >
                        {uploading ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                            <span className="ms-2">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <FaUpload className="me-2" />
                            Upload Picture
                          </>
                        )}
                      </Button>
                    </div>
                  </Col>
                  
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleChange}
                        placeholder="Your full name"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="bio"
                        value={profileData.bio}
                        onChange={handleChange}
                        placeholder="Tell others a bit about yourself"
                      />
                    </Form.Group>
                    
                    <div className="d-flex mt-4 justify-content-between">
                      <Button 
                        variant="secondary" 
                        onClick={() => navigate('/profile')}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditProfile;
