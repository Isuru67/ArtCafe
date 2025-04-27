import React, { useState, useContext } from 'react';
import { Form, Button, Card, Container, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaImage } from 'react-icons/fa';
import { createPost, uploadPostImage } from '../../services/postService';
import { AuthContext } from '../../context/AuthContext';

const CreatePost = () => {
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    imageUrl: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleUpload = async () => {
    if (!imageFile) return;
    
    try {
      setUploading(true);
      setError('');
      
      const response = await uploadPostImage(imageFile);
      
      setPostData(prevData => ({
        ...prevData,
        imageUrl: response.imageUrl
      }));
      
      setUploading(false);
    } catch (error) {
      setError('Failed to upload image. Please try again.');
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If there's an image selected but not uploaded yet
    if (imageFile && !postData.imageUrl) {
      setError('Please upload the image before submitting');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const newPost = await createPost(postData);
      
      navigate(`/posts/${newPost.id}`);
    } catch (error) {
      setError('Failed to create post. Please try again.');
      setSubmitting(false);
    }
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
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Image</Form.Label>
              <div className="d-flex align-items-center mb-3">
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="me-3"
                />
                <Button
                  variant="secondary"
                  onClick={handleUpload}
                  disabled={!imageFile || uploading || postData.imageUrl}
                >
                  {uploading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FaUpload className="me-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
              
              {previewUrl && (
                <div className="position-relative mb-3">
                  <div className="ratio ratio-16x9" style={{ maxHeight: '400px' }}>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="rounded object-fit-contain"
                    />
                  </div>
                  {postData.imageUrl && (
                    <div className="position-absolute top-0 end-0 bg-success text-white px-2 py-1 rounded-pill m-2">
                      <FaImage className="me-1" /> Uploaded
                    </div>
                  )}
                </div>
              )}
              <Form.Text className="text-muted">
                Upload an image of your artwork. Max size: 5MB. Supported formats: JPEG, PNG, GIF, WEBP.
              </Form.Text>
            </Form.Group>
            
            <div className="d-flex justify-content-between">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={submitting || !postData.title || !postData.content}
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
