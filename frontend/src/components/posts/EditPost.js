import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Card, Container, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostById, updatePost } from '../../services/postService';
import { AuthContext } from '../../context/AuthContext';

const EditPost = () => {
  const { id } = useParams();
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
  
  useEffect(() => {
    fetchPost();
  }, [id]);
  
  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await getPostById(id);
      
      // Ensure the user is the owner of this post
      if (currentUser && data.user.id !== currentUser.id) {
        setError('You do not have permission to edit this post.');
        navigate(`/posts/${id}`);
        return;
      }
      
      setPostData({
        title: data.title,
        content: data.content
      });
      
      setOriginalPost(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load post. The post may have been deleted or is unavailable.');
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
      
      await updatePost(id, postData);
      
      navigate(`/posts/${id}`);
    } catch (error) {
      setError('Failed to update post. Please try again.');
      setSubmitting(false);
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
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">Edit Post</h2>
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
            
            <div className="d-flex justify-content-between">
              <Button 
                variant="secondary" 
                onClick={() => navigate(`/posts/${id}`)}
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
    </Container>
  );
};

export default EditPost;
