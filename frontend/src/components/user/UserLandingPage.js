import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getPostsByUsername, toggleLike } from '../../services/postService';
import { IMAGE_BASE_URL } from '../../config';

const UserLandingPage = () => {
  const { username } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [pageTitle, setPageTitle] = useState('');
  const [loadedPostIds, setLoadedPostIds] = useState(new Set());

  // Combined useEffect to handle both reset and initial data fetch
  useEffect(() => {
    // Verify authentication
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Set page title based on whether viewing own profile or not
    if (currentUser.username === username) {
      setPageTitle('Your Posts');
    } else {
      setPageTitle(`Posts by ${username}`);
    }
    
    // Reset all state when username changes
    setUserPosts([]);
    setPage(0);
    setHasMore(true);
    setLoading(true);
    setLoadedPostIds(new Set());
    
    // Fetch initial data
    fetchInitialPosts();
    
  }, [username, currentUser, navigate]);

  // Fetch posts when page changes (for "Load More" functionality)
  useEffect(() => {
    // Only fetch more posts if the page number is > 0
    // (page 0 is handled by fetchInitialPosts in the first useEffect)
    if (page > 0 && currentUser) {
      fetchMorePosts();
    }
  }, [page]);
  
  const fetchInitialPosts = async () => {
    try {
      setLoading(true);
      const response = await getPostsByUsername(username, 0);
      
      if (!response.posts || response.posts.length === 0) {
        setHasMore(false);
        setUserPosts([]);
      } else {
        setUserPosts(response.posts);
        
        // Update set of loaded post IDs
        const newIds = new Set();
        response.posts.forEach(post => newIds.add(post.id));
        setLoadedPostIds(newIds);
        
        // Check if there might be more posts
        if (response.posts.length < 10) { // Assuming page size is 10
          setHasMore(false);
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
  
  const fetchMorePosts = async () => {
    if (!hasMore || loading) return;
    
    try {
      setLoading(true);
      const response = await getPostsByUsername(username, page);
      
      if (!response.posts || response.posts.length === 0) {
        setHasMore(false);
      } else {
        // Filter out posts we've already seen
        const newPosts = response.posts.filter(post => !loadedPostIds.has(post.id));
        
        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          // Update posts using functional update
          setUserPosts(prevPosts => [...prevPosts, ...newPosts]);
          
          // Update set of loaded post IDs
          const updatedIds = new Set(loadedPostIds);
          newPosts.forEach(post => updatedIds.add(post.id));
          setLoadedPostIds(updatedIds);
          
          // Check if there might be more posts
          if (newPosts.length < 10) { // Assuming page size is 10
            setHasMore(false);
          }
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
  
  const loadMorePosts = () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };
  
  const handleLikeToggle = async (postId) => {
    if (!currentUser) {
      return;
    }
    
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

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  if (loading && userPosts.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">{pageTitle}</h2>
      
      <Row>
        {userPosts.length === 0 && !loading ? (
          <Col>
            <Alert variant="info" className="text-center">
              <p className="mb-0">No posts available</p>
              {currentUser.username === username && (
                <Button 
                  as={Link} 
                  to={`/${currentUser.username}/create-post`}
                  variant="primary"
                  className="mt-3"
                >
                  Create Your First Post
                </Button>
              )}
            </Alert>
          </Col>
        ) : (
          userPosts.map(post => (
            <Col md={6} lg={4} key={post.id} className="mb-4">
              <Card className="h-100 shadow-sm">
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
                
                <Card.Body className="d-flex flex-column">
                  <Link to={`/posts/${post.id}`} className="text-decoration-none text-dark">
                    <Card.Title>{post.title}</Card.Title>
                  </Link>
                  <Card.Text className="text-truncate mb-4">
                    {post.content}
                  </Card.Text>
                  
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-3">
                      <Button 
                        variant="link" 
                        className="p-0 text-muted text-decoration-none"
                        onClick={() => handleLikeToggle(post.id)}
                        disabled={!currentUser}
                      >
                        {post.likedByCurrentUser ? (
                          <FaHeart className="text-danger" />
                        ) : (
                          <FaRegHeart />
                        )} 
                        <span className="ms-1">{post.likeCount}</span>
                      </Button>
                      
                      <Link to={`/posts/${post.id}`} className="btn btn-link p-0 text-muted text-decoration-none">
                        <FaComment /> <span className="ms-1">{post.commentCount}</span>
                      </Link>
                    </div>
                    
                    {currentUser && post.user.id === currentUser.id && (
                      <Link to={`/edit-post/${post.id}`} className="btn btn-sm btn-outline-secondary">
                        Edit
                      </Link>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
      
      {hasMore && (
        <div className="text-center mt-4">
          <Button 
            variant="outline-primary" 
            onClick={loadMorePosts} 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </Container>
  );
};

export default UserLandingPage;
