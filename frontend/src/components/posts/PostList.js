import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment, FaSignInAlt } from 'react-icons/fa';
import { getPosts, toggleLike } from '../../services/postService';
import { AuthContext } from '../../context/AuthContext';
import { IMAGE_BASE_URL } from '../../config';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!currentUser) {
      navigate('/login', { state: { message: 'Please login to view posts.' } });
      return;
    }
    
    // Initial load of posts if user is authenticated
    const initialLoad = async () => {
      try {
        setLoading(true);
        const response = await getPosts(0);
        
        if (response.posts.length === 0) {
          setHasMore(false);
        } else {
          setPosts(response.posts);
          setPage(1);
        }
        
        setLoading(false);
      } catch (error) {
        // Check if error is due to authentication
        if (error.response && error.response.status === 401) {
          navigate('/login', { state: { message: 'Your session has expired. Please login again.' } });
        } else {
          setError('Failed to load posts. Please try again later.');
          setLoading(false);
        }
      }
    };
    
    initialLoad();
  }, [currentUser, navigate]);

  const fetchMorePosts = async () => {
    if (loadingMore) return;
    
    try {
      setLoadingMore(true);
      const response = await getPosts(page);
      
      if (response.posts.length === 0) {
        setHasMore(false);
      } else {
        // Ensure no duplicates by checking IDs
        const newPosts = response.posts.filter(
          newPost => !posts.some(existingPost => existingPost.id === newPost.id)
        );
        
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
        setPage(prevPage => prevPage + 1);
      }
      
      setLoadingMore(false);
    } catch (error) {
      setError('Failed to load more posts. Please try again later.');
      setLoadingMore(false);
    }
  };

  const handleLikeToggle = async (postId) => {
    if (!currentUser) {
      return;
    }

    try {
      const response = await toggleLike(postId);
      
      setPosts(posts.map(post => {
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
        <Card.Header className="bg-white d-flex align-items-center">
          <img 
            src={post.user.profilePicture ? `${IMAGE_BASE_URL}${post.user.profilePicture}` : 'https://via.placeholder.com/40'} 
            alt={post.user.username}
            className="avatar me-2"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
          />
          <div>
            <Link to={`/users/${post.user.id}`} className="text-decoration-none">
              <strong>{post.user.fullName || post.user.username}</strong>
            </Link>
            <p className="text-muted mb-0 small">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </Card.Header>
        
        {post.imageUrl && (
          <Link to={`/posts/${post.id}`}>
            <Card.Img 
              variant="top" 
              src={post.imageUrl.startsWith('data:') ? post.imageUrl : `${IMAGE_BASE_URL}${post.imageUrl}`}
              className="post-image"
              alt={post.imageName || 'Post image'}
              onError={(e) => { 
                e.target.style.display = 'none';
                e.target.parentNode.classList.add('post-image-fallback');
                e.target.parentNode.innerHTML = '<div class="text-center p-3">Image not available</div>';
              }}
            />
          </Link>
        )}
        
        <Card.Body>
          <Link to={`/posts/${post.id}`} className="text-decoration-none text-dark">
            <Card.Title>{post.title}</Card.Title>
          </Link>
          <Card.Text className="post-content">
            {post.content.length > 150 
              ? `${post.content.substring(0, 150)}...` 
              : post.content}
          </Card.Text>
          
          <div className="d-flex justify-content-between align-items-center">
            <div className="post-actions">
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
    );
  };

  return (
    <div className="py-4">
      <h1 className="mb-4 text-center">Explore Artwork</h1>
      
      {error && (
        <div className="alert alert-danger text-center">{error}</div>
      )}
      
      {!currentUser ? (
        <div className="text-center py-5">
          <Alert variant="info">
            <h4>Login Required</h4>
            <p>You need to be logged in to view posts.</p>
            <Button 
              as={Link} 
              to="/login" 
              variant="primary"
              className="mt-3"
            >
              <FaSignInAlt className="me-2" /> Login to Continue
            </Button>
          </Alert>
        </div>
      ) : (
        <Row>
          {posts.length === 0 && !loading ? (
            <Col>
              <div className="text-center py-5">
                <h3>No posts yet</h3>
                {currentUser && (
                  <p>
                    <Link to="/create-post" className="btn btn-primary mt-3">
                      Create the first post
                    </Link>
                  </p>
                )}
              </div>
            </Col>
          ) : (
            <Col lg={8} className="mx-auto">
              {posts.map(post => renderPostCard(post))}
            </Col>
          )}
        </Row>
      )}
      
      {hasMore && currentUser && (
        <div className="text-center mt-4 mb-5">
          <Button 
            variant="outline-primary" 
            onClick={fetchMorePosts} 
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Loading...</span>
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostList;
