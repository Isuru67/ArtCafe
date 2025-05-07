import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Tab, Nav } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { FaUpload, FaUser, FaArrowLeft, FaCamera, FaExclamationTriangle } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL, IMAGE_BASE_URL } from '../../config';

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
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    // Ensure auth token is set properly
    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Initialize form with current user data
    setProfileData({
      fullName: currentUser.fullName || '',
      bio: currentUser.bio || ''
    });
    
    if (currentUser.profilePicture) {
      setPreviewUrl(`${IMAGE_BASE_URL}${currentUser.profilePicture}`);
      setImageError(false); // Reset image error when setting new image
    }
    
    setLoading(false);
  }, [currentUser, navigate]);
  
  // Handle image loading errors
  const handleImageError = () => {
    console.log("Profile image failed to load, using placeholder");
    setImageError(true);
  };
  
  // Get image source with fallback
  const getImageSrc = () => {
    if (profilePicture) {
      // If there's a new selected file, use its preview URL
      return previewUrl;
    } else if (!imageError && currentUser?.profilePicture) {
      // If there's an existing profile picture and no error
      return `${IMAGE_BASE_URL}${currentUser.profilePicture}`;
    } else {
      // Fallback to placeholder
      return 'https://via.placeholder.com/150';
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
      
      const formData = new FormData();
      formData.append('file', profilePicture);
      
      console.log("Uploading profile picture...");
      
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post(
        `${API_BASE_URL}/api/users/profile/picture`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("Upload response:", response.data);
      
      if (response.data) {
        // Update the user in context with the new profile picture URL
        updateUserInContext({
          ...currentUser,
          profilePicture: response.data.profilePicture
        });
        
        // Show success message and reset form state
        setSuccessMessage('Profile picture updated successfully!');
        setProfilePicture(null);
        
        // Set the new preview URL and reset error state
        if (response.data.profilePicture) {
          setPreviewUrl(`${IMAGE_BASE_URL}${response.data.profilePicture}`);
          setImageError(false);
        }
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      
      // Enhanced error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
        setError(`Failed to upload: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        setError('Network error. Please check your internet connection and try again.');
      } else {
        // Something happened in setting up the request
        setError('Failed to upload profile picture. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      console.log("Updating profile data:", profileData);
      
      const token = localStorage.getItem('authToken');
      
      const response = await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        profileData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("Profile update response:", response.data);
      
      if (response.data) {
        // Update the user in context with the full updated user data
        updateUserInContext({
          ...currentUser,
          fullName: response.data.fullName,
          bio: response.data.bio
        });
        
        setSuccessMessage('Profile updated successfully!');
        
        // Scroll to top to show the success message
        window.scrollTo(0, 0);
        
        // Navigate back to profile after short delay
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Enhanced error handling
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
        setError(`Failed to update profile: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        console.error("Error request:", error.request);
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
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
    <div className="edit-profile-page">
      {/* Header with gradient background */}
      <div className="page-header py-4" style={{ 
        background: 'linear-gradient(135deg, #4568dc 0%, #b06ab3 100%)',
        color: 'white',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <Container>
          <div className="d-flex align-items-center">
            <Button 
              variant="link" 
              className="p-0 text-white me-3" 
              onClick={() => navigate('/profile')}
            >
              <FaArrowLeft size={18} /> 
            </Button>
            <div>
              <h2 className="mb-0 fw-bold">Edit Profile</h2>
              <p className="text-white-50 mb-0 mt-1">Update your personal information</p>
            </div>
          </div>
        </Container>
      </div>
      
      <Container className="py-5">
        {error && (
          <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
            <FaExclamationTriangle className="me-2" />
            <div>{error}</div>
          </Alert>
        )}
        
        {successMessage && (
          <Alert variant="success" className="mb-4 shadow-sm">
            {successMessage}
          </Alert>
        )}
        
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="border-0 shadow">
              <Card.Body className="p-md-5 p-4">
                <Form onSubmit={handleSubmit}>
                  <div className="text-center mb-5">
                    <div className="position-relative d-inline-block">
                      <img 
                        src={getImageSrc()}
                        alt="Profile" 
                        className="rounded-circle"
                        style={{ 
                          width: '150px', 
                          height: '150px', 
                          objectFit: 'cover',
                          border: '4px solid #fff',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                        }}
                        onError={handleImageError}
                      />
                      
                      {/* Camera icon overlay for image upload */}
                      <div className="position-absolute bottom-0 end-0">
                        <Form.Label 
                          htmlFor="profilePictureInput" 
                          className="btn btn-primary rounded-circle p-2 m-1" 
                          style={{ cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
                        >
                          <FaCamera />
                          <Form.Control
                            id="profilePictureInput"
                            type="file"
                            accept="image/*"
                            onChange={handlePictureChange}
                            style={{ display: 'none' }}
                          />
                        </Form.Label>
                      </div>
                    </div>
                    
                    {/* Upload button only shown when a new image is selected */}
                    {profilePicture && (
                      <div className="mt-3">
                        <Button
                          variant="primary"
                          onClick={handlePictureUpload}
                          disabled={uploading}
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
                              Upload New Picture
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                
                  <hr className="mb-4" />
                  
                  <h4 className="mb-4 fw-bold">Personal Information</h4>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="form-control-lg border-0 bg-light"
                      style={{ boxShadow: 'none' }}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      placeholder="Tell others about yourself, your interests, and your artistic style"
                      className="form-control-lg border-0 bg-light"
                      style={{ resize: 'none', boxShadow: 'none' }}
                    />
                    <Form.Text className="text-muted">
                      Your bio will be displayed on your profile page
                    </Form.Text>
                  </Form.Group>
                  
                  <hr className="my-4" />
                  
                  <h4 className="mb-4 fw-bold">Account Information</h4>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentUser.username}
                      disabled
                      className="form-control-lg border-0 bg-light"
                      style={{ boxShadow: 'none' }}
                    />
                    <Form.Text className="text-muted">
                      Username cannot be changed
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-5">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={currentUser.email}
                      disabled
                      className="form-control-lg border-0 bg-light"
                      style={{ boxShadow: 'none' }}
                    />
                    <Form.Text className="text-muted">
                      Email cannot be changed
                    </Form.Text>
                  </Form.Group>
                  
                  <div className="d-flex justify-content-between pt-2">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => navigate('/profile')}
                      className="px-4 py-2"
                      style={{ borderRadius: '30px' }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2"
                      style={{ borderRadius: '30px' }}
                    >
                      {saving ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                          <span className="ms-2">Saving...</span>
                        </>
                      ) : 'Save Changes'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EditProfile;
