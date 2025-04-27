import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { getUserById } from '../../services/userService';
import { getPosts, toggleLike } from '../../services/postService';
import { AuthContext } from '../../context/AuthContext';
import { IMAGE_BASE_URL } from '../../config';

const UserPublicProfile = () => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, [id]);
  
  const fetchUserProfile = async () => {
    try {
      const userData = await getUserById(id);
      setUser(userData);
    } catch (error) {
      setError('Failed to load user profile. The user may not exist.');
    }
  };
  
  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await getPosts(page);
      
      // Filter posts by the user ID from URL
      const filteredPosts = response.posts.filter(post => post.user.id.toString() === id);
      
      if (filteredPosts.length === 0) {
        setHasMore(false);
      } else {
        setUserPosts(prevPosts => [...prevPosts, ...filteredPosts]);
        setPage(prevPage => prevPage + 1);
      }
      
      setLoading(false);
    } catch (error) {
      setError('Failed to load posts. Please try again later.');
      setLoading(false);
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

  if (loading && !user) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="pb-5">
      <div className="profile-header">
        <Container>
          <Row className="align-items-center">
            <Col md={3} className="text-center text-md-start">
              <img 
                src={user?.profilePicture 
                  ? `${IMAGE_BASE_URL}${user.profilePicture}` 
                  : 'https://via.placeholder.com/150'
                } 
                alt={user?.username}
                className="profile-avatar mb-3 mb-md-0"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
              />
            </Col>
            <Col md={9}>
              <h2>{user?.fullName || user?.username}</h2>
              <p className="lead">@{user?.username}</p>
              <p>{user?.bio || 'No bio yet'}</p>
            </Col>
          </Row>
        </Container>
      </div>
      
      <Container className="mt-5">
        <h3 className="mb-4">Posts by {user?.fullName || user?.username}</h3>
        
        <Row>
          {userPosts.length === 0 && !loading ? (
            <Col>
              <Alert variant="info" className="text-center">
                <p className="mb-0">No posts available</p>
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
              onClick={fetchUserPosts} 
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default UserPublicProfile;
