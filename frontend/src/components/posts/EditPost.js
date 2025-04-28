import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Card, Container, Alert, Spinner, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostById, updatePost, deletePost } from '../../services/postService';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const EditPost = () => {
  // Extract ID correctly from URL parameters
  const { id, username } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  const [postData, setPostData] = useState({
    title: '',
    content: ''
  });
  
  const [originalPost, setOriginalPost] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Add state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    // Ensure auth token is set
    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Log the parameters to debug
    console.log("URL Parameters - ID:", id, "Username:", username);
    
    // Only fetch post if we have a valid ID
    if (id) {
      fetchPost();
    } else {
      console.error("No post ID provided");
      setError("No post ID provided");
      setLoading(false);
    }
  }, [id]);
  
  const fetchPost = async () => {
    try {
      setLoading(true);
      
      // Clear debug: Log the exact ID being used for the API call
      console.log("Making API call to fetch post with ID:", id);
      
      // Use the getPostById function from postService
      const data = await getPostById(id);
      console.log("Post data received:", data);
      
      if (!data || !data.id) {
        throw new Error("Invalid post data received");
      }
      
      // Ensure the user is the owner of this post
      if (currentUser && data.user.id !== currentUser.id) {
        console.error("Permission denied: Post owner doesn't match current user");
        setError('You do not have permission to edit this post.');
        
        setTimeout(() => {
          // Navigate back to appropriate page
          if (username) {
            navigate(`/${username}`);
          } else {
            navigate(`/posts/${id}`);
          }
        }, 2000);
        return;
      }
      
      setPostData({
        title: data.title || '',
        content: data.content || ''
      });
      
      setOriginalPost(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching post:", error);
      
      // Check for specific error types
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
        
        if (error.response.status === 404) {
          setError('Post not found. It may have been deleted.');
        } else if (error.response.status === 403) {
          setError('You do not have permission to view this post.');
        } else if (error.response.status === 401) {
          setError('Please log in to view this post.');
          // Redirect to login after a short delay
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(`Failed to load post: ${error.response.data.message || 'Server error'}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        setError('Network error. Please check your internet connection and try again.');
      } else {
        // Something happened in setting up the request
        setError('Failed to load post. The post may have been deleted or is unavailable.');
      }
      
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError('');
      
      console.log("Updating post with ID:", id, "and data:", postData);
      await updatePost(id, postData);
      
      // After successful update, navigate to appropriate page
      if (username) {
        navigate(`/${username}`);
      } else if (currentUser) {
        navigate(`/${currentUser.username}`);
      } else {
        navigate(`/posts/${id}`);
      }
    } catch (error) {
      console.error("Error updating post:", error);
      setError('Failed to update post. Please try again.');
      setSubmitting(false);
    }
  };
  
  // Add handler for delete button
  const handleDeletePost = async () => {
    try {
      setDeleting(true);
      setError('');
      
      console.log("Deleting post with ID:", id);
      await deletePost(id);
      
      // Close the modal
      setShowDeleteModal(false);
      
      // Show success message briefly before redirecting
      setError('Post deleted successfully');
      setTimeout(() => {
        // Navigate to user's profile after deletion
        if (username) {
          navigate(`/${username}`);
        } else if (currentUser) {
          navigate(`/${currentUser.username}`);
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (error) {
      console.error("Error deleting post:", error);
      setError('Failed to delete post. Please try again.');
      setDeleting(false);
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
      <Card className="shadow">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Edit Post</h2>
          <Button 
            variant="danger" 
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Post
          </Button>
        </Card.Header>
        <Card.Body className="p-4">
          {error && <Alert variant={error.includes('deleted successfully') ? 'success' : 'danger'}>
            {error}
          </Alert>}
          
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
            
            <div className="d-flex justify-content-between">
              <Button 
                variant="secondary" 
                onClick={() => {
                  if (username) {
                    navigate(`/${username}`);
                  } else if (currentUser) {
                    navigate(`/${currentUser.username}`);
                  } else {
                    navigate(`/posts/${id}`);
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={submitting || !postData.title || !postData.content}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this post? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeletePost}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EditPost;
