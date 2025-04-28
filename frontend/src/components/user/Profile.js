import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { getPostsByUsername, toggleLike } from '../../services/postService';
import { IMAGE_BASE_URL } from '../../config';

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadedPostIds, setLoadedPostIds] = useState(new Set()); // Track loaded post IDs
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Reset state
    setUserPosts([]);
    setPage(0);
    setHasMore(true);
    setLoading(true);
    setLoadedPostIds(new Set());
    
    fetchUserPosts();
  }, [currentUser, navigate]);
  
  const fetchUserPosts = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await getPostsByUsername(currentUser.username, page);
      
      if (!response.posts || response.posts.length === 0) {
        setHasMore(false);
      } else {
        // Filter out any posts we've already loaded (prevent duplicates)
        const newPosts = response.posts.filter(post => !loadedPostIds.has(post.id));
        
        // If no new posts were returned, we've reached the end
        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          // Add new posts to state and update our tracking of loaded post IDs
          setUserPosts(prevPosts => [...prevPosts, ...newPosts]);
          
          // Update the set of loaded post IDs
          const updatedLoadedIds = new Set(loadedPostIds);
          newPosts.forEach(post => updatedLoadedIds.add(post.id));
          setLoadedPostIds(updatedLoadedIds);
          
          // Increment page for next load
          setPage(prevPage => prevPage + 1);
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError('Failed to load posts. Please try again later.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLikeToggle = async (postId) => {
    try {
      const response = await toggleLike(postId);
      
      setUserPosts(userPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likeCount: response.likeCount,
            likedByCurrentUser: response.liked
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  const renderPostCard = (post) => {
    return (
      <Card className="mb-4" key={post.id}>
        {post.imageUrl && (
          <Link to={`/posts/${post.id}`}>
            <Card.Img 
              variant="top" 
              src={`${IMAGE_BASE_URL}${post.imageUrl}`} 
              className="post-image"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found'; }}
            />
          </Link>
        )}
        
        <Card.Body>
          <Link to={`/posts/${post.id}`} className="text-decoration-none text-dark">
            <Card.Title>{post.title}</Card.Title>
          </Link>
          <Card.Text>
            {post.content.length > 100 
              ? `${post.content.substring(0, 100)}...` 
              : post.content}
          </Card.Text>
          
          <div className="d-flex justify-content-between align-items-center">
            <div className="post-actions">
              <Button 
                variant="link" 
                className="p-0 text-muted text-decoration-none"
                onClick={() => handleLikeToggle(post.id)}
              >
                {post.likedByCurrentUser ? (
                  <FaHeart className="text-danger" />
                ) : (
                  <FaRegHeart />
                )} 
                <span className="ms-1">{post.likeCount}</span>
              </Button>
              
              <Link to={`/posts/${post.id}`} className="btn btn-link p-0 text-muted text-decoration-none ms-3">
                <FaComment /> <span className="ms-1">{post.commentCount}</span>
              </Link>
            </div>
            
            <Link to={`/edit-post/${post.id}`} className="btn btn-sm btn-outline-secondary">
              <FaEdit /> Edit
            </Link>
          </div>
        </Card.Body>
        <Card.Footer className="text-muted small">
          {new Date(post.createdAt).toLocaleString()}
        </Card.Footer>
      </Card>
    );
  };
  
  if (!currentUser) {
    return <Spinner animation="border" className="d-block mx-auto my-5" />;
  }

  return (
    <div className="pb-5">
      <div className="profile-header">
        <Container>
          <Row className="align-items-center">
            <Col md={3} className="text-center text-md-start">
              <img 
                src={currentUser.profilePicture 
                  ? `${IMAGE_BASE_URL}${currentUser.profilePicture}` 
                  : 'https://via.placeholder.com/150'
                } 
                alt={currentUser.username}
                className="profile-avatar mb-3 mb-md-0"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
              />
            </Col>
            <Col md={9}>
              <h2>{currentUser.fullName || currentUser.username}</h2>
              <p className="lead">@{currentUser.username}</p>
              <p>{currentUser.bio || 'No bio yet'}</p>
              <Button as={Link} to="/edit-profile" variant="light">
                <FaEdit /> Edit Profile
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
      
      <Container className="mt-5">
        <Tabs defaultActiveKey="posts" className="mb-4">
          <Tab eventKey="posts" title="My Posts">
            <Row>
              {userPosts.length === 0 && !loading ? (
                <Col>
                  <Alert variant="info" className="text-center">
                    <p className="mb-2">You haven't created any posts yet.</p>
                    <Button as={Link} to="/create-post" variant="primary">
                      Create Your First Post
                    </Button>
                  </Alert>
                </Col>
              ) : (
                <>
                  {userPosts.map(post => (
                    <Col md={6} lg={4} key={post.id} className="mb-4">
                      {renderPostCard(post)}
                    </Col>
                  ))}
                </>
              )}
            </Row>
            
            {hasMore && (
              <div className="text-center mt-4">
                <Button 
                  variant="outline-primary" 
                  onClick={fetchUserPosts} 
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default Profile;
