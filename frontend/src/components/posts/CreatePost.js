import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Card, Container, Alert, Image } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { createPost } from '../../services/postService';
import { AuthContext } from '../../context/AuthContext';

const CreatePost = () => {
  const [postData, setPostData] = useState({
    title: '',
    content: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { username } = useParams();
  
  // Verify the current user matches the username in the URL
  useEffect(() => {
    if (currentUser && username !== currentUser.username) {
      setError("You don't have permission to create posts for this user");
      // Optionally redirect after a delay
      setTimeout(() => navigate(`/${currentUser.username}`), 3000);
    }
  }, [currentUser, username, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError('');
      
      // Create FormData object to send both text data and file
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      // Pass username and FormData to create the post
      const newPost = await createPost(formData, username);
      
      navigate(`/${username}`);
    } catch (error) {
      setError('Failed to create post. Please try again.');
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Clean up preview URL when canceling
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    // Navigate back to the user's profile page
    navigate(`/${username}`);
  };

  return (
    <Container className="py-5">
      <Card className="shadow">
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">Create New Post</h2>
        </Card.Header>
        <Card.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={postData.title}
                onChange={handleChange}
                placeholder="Give your artwork a title"
                required
                disabled={!!error}
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="content"
                value={postData.content}
                onChange={handleChange}
                placeholder="Describe your artwork, share your inspiration, or tell the story behind it."
                required
                disabled={!!error}
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={!!error}
              />
              <Form.Text className="text-muted">
                Upload an image of your artwork (optional)
              </Form.Text>
            </Form.Group>
            
            {previewImage && (
              <div className="mb-4 text-center">
                <p>Preview:</p>
                <Image 
                  src={previewImage} 
                  alt="Preview" 
                  fluid 
                  thumbnail 
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}
            
            <div className="d-flex justify-content-between">
              <Button 
                variant="secondary" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={submitting || !postData.title || !postData.content || !!error}
              >
                {submitting ? 'Creating...' : 'Create Post'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreatePost;
