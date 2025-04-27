import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { getPosts, toggleLike } from '../../services/postService';
import { AuthContext } from '../../context/AuthContext';
import { IMAGE_BASE_URL } from '../../config';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getPosts(page);
      
      if (response.posts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prevPosts => [...prevPosts, ...response.posts]);
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
      
      {hasMore && (
        <div className="text-center mt-4 mb-5">
          <Button 
            variant="outline-primary" 
            onClick={fetchPosts} 
            disabled={loading}
          >
            {loading ? (
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
