import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaTrashAlt, FaEdit, FaUser } from 'react-icons/fa';
import { getPostById, toggleLike, deletePost, getCommentsByPostId, addComment, updateComment, deleteComment } from '../../services/postService';
import { AuthContext } from '../../context/AuthContext';
import { IMAGE_BASE_URL } from '../../config';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentError, setCommentError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!currentUser) {
      navigate('/login', { state: { message: 'Please login to view post details.' } });
      return;
    }
    
    fetchPost();
    fetchComments();
  }, [id, currentUser, navigate]);

  const fetchPost = async () => {
    try {
      const data = await getPostById(id);
      setPost(data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate('/login', { state: { message: 'Your session has expired. Please login again.' } });
      } else {
        setError('Error loading post. The post may have been deleted or is unavailable.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (reset = false) => {
    try {
      setCommentLoading(true);
      const currentPage = reset ? 0 : page;
      const response = await getCommentsByPostId(id, currentPage);
      
      if (response.comments.length === 0) {
        setHasMoreComments(false);
      } else {
        if (reset) {
          // When resetting, just use the new comments
          setComments(response.comments);
        } else {
          // When appending, ensure we don't add duplicates
          setComments(prevComments => {
            // Get IDs of existing comments for easy lookup
            const existingIds = new Set(prevComments.map(comment => comment.id));
            
            // Filter out any duplicates from the new comments
            const newUniqueComments = response.comments.filter(
              comment => !existingIds.has(comment.id)
            );
            
            // Return combined array with no duplicates
            return [...prevComments, ...newUniqueComments];
          });
        }
        setPage(currentPage + 1);
      }
    } catch (error) {
      setCommentError('Failed to load comments.');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const response = await toggleLike(id);
      setPost({
        ...post,
        likeCount: response.likeCount,
        likedByCurrentUser: response.liked
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await deletePost(id);
        navigate('/');
      } catch (error) {
        setError('Failed to delete post. Please try again.');
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!commentContent.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }
    
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setCommentError(null);
      setCommentLoading(true);
      
      // Call the addComment service function with postId and content
      const newComment = await addComment(id, commentContent);
      
      // Check if the comment already exists in our state to avoid duplicates
      const commentExists = comments.some(comment => comment.id === newComment.id);
      
      if (!commentExists) {
        // Update local state with the new comment, ensuring we don't duplicate
        setComments(prevComments => {
          // Create a new array with the new comment at the beginning
          return [newComment, ...prevComments];
        });
        
        // Update post's comment count
        setPost(prevPost => ({
          ...prevPost,
          commentCount: prevPost.commentCount + 1
        }));
      }
      
      // Clear the input
      setCommentContent('');
      
    } catch (error) {
      console.error('Error adding comment:', error);
      if (error.response && error.response.data) {
        setCommentError(`Failed to add comment: ${error.response.data.message || 'Unknown error'}`);
      } else {
        setCommentError('Failed to add comment. Please try again.');
      }
    } finally {
      setCommentLoading(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async (commentId) => {
    try {
      setCommentError(null);
      await updateComment(id, commentId, editContent);
      
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, content: editContent, updatedAt: new Date().toISOString() };
        }
        return comment;
      }));
      
      setEditingComment(null);
    } catch (error) {
      setCommentError('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(id, commentId);
        setComments(comments.filter(comment => comment.id !== commentId));
      } catch (error) {
        setCommentError('Failed to delete comment. Please try again.');
      }
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

  if (error || !post) {
    return (
      <Alert variant="danger" className="my-5">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error || 'Post not found'}</p>
        <div className="d-flex justify-content-end">
          <Button variant="outline-danger" onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </Alert>
    );
  }

  if (!currentUser) {
    return (
      <Alert variant="info" className="my-5 text-center">
        <Alert.Heading>Login Required</Alert.Heading>
        <p>You need to be logged in to view this post.</p>
        <div className="d-grid gap-2 col-6 mx-auto">
          <Button as={Link} to="/login" variant="primary">
            Login to Continue
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                {post.user.profilePicture ? (
                  <img 
                    src={`${IMAGE_BASE_URL}${post.user.profilePicture}`}
                    alt={post.user.username}
                    className="avatar me-2"
                    onError={(e) => {
                      // Replace with inline rendered icon instead of external URL
                      e.target.style.display = 'none';
                      e.target.parentNode.appendChild(
                        document.createElement('div')
                      ).className = 'avatar avatar-fallback me-2';
                    }}
                  />
                ) : (
                  <div className="avatar avatar-fallback me-2"></div>
                )}
                <div>
                  <Link to={`/users/${post.user.id}`} className="text-decoration-none">
                    <strong>{post.user.fullName || post.user.username}</strong>
                  </Link>
                  <p className="text-muted mb-0 small">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {currentUser && currentUser.id === post.user.id && (
                <div>
                  <Button 
                    as={Link}
                    to={`/edit-post/${post.id}`}
                    variant="outline-secondary" 
                    size="sm"
                    className="me-2"
                  >
                    <FaEdit /> Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={handleDelete}
                  >
                    <FaTrashAlt /> Delete
                  </Button>
                </div>
              )}
            </Card.Header>
            
            {post.imageUrl && (
              <div className="post-image-container">
                <Card.Img 
                  variant="top" 
                  src={post.imageUrl.startsWith('data:') ? post.imageUrl : `${IMAGE_BASE_URL}${post.imageUrl}`}
                  className="post-image"
                  alt={post.imageName || 'Post image'}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('post-image-fallback');
                    e.target.parentNode.innerHTML = '<div class="text-center p-5">Image not available</div>';
                  }}
                />
              </div>
            )}
            
            <Card.Body>
              <Card.Title className="mb-3">{post.title}</Card.Title>
              <Card.Text className="post-content">{post.content}</Card.Text>
              
              <div className="d-flex align-items-center mt-4">
                <Button 
                  variant="link" 
                  className="p-0 text-muted text-decoration-none me-3"
                  onClick={handleLikeToggle}
                  disabled={!currentUser}
                >
                  {post.likedByCurrentUser ? (
                    <FaHeart className="text-danger" />
                  ) : (
                    <FaRegHeart />
                  )} 
                  <span className="ms-1">{post.likeCount} likes</span>
                </Button>
              </div>
            </Card.Body>
            
            <Card.Footer className="bg-white comment-section">
              <h5 className="mb-4">Comments ({post.commentCount})</h5>
              
              {currentUser && (
                <Form onSubmit={handleAddComment} className="mb-4">
                  <Form.Group className="mb-2">
                    <Form.Control
                      as="textarea"
                      placeholder="Write a comment..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      rows={2}
                      required
                    />
                  </Form.Group>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="sm"
                    disabled={commentLoading || !commentContent.trim()}
                  >
                    {commentLoading ? 'Posting...' : 'Post Comment'}
                  </Button>
                </Form>
              )}
              
              {commentError && <Alert variant="danger">{commentError}</Alert>}
              
              {comments.length > 0 ? (
                <div>
                  {comments.map(comment => (
                    <Card key={comment.id} className="mb-3 border-0 bg-light">
                      <Card.Body className="py-3">
                        <div className="d-flex align-items-start">
                          {comment.user.profilePicture ? (
                            <img 
                              src={`${IMAGE_BASE_URL}${comment.user.profilePicture}`}
                              alt={comment.user.username}
                              className="avatar avatar-sm me-2"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentNode.appendChild(
                                  document.createElement('div')
                                ).className = 'avatar avatar-sm avatar-fallback me-2';
                              }}
                            />
                          ) : (
                            <div className="avatar avatar-sm avatar-fallback me-2"></div>
                          )}
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <div>
                                <strong className="me-2">{comment.user.fullName || comment.user.username}</strong>
                                <small className="text-muted">
                                  {new Date(comment.createdAt).toLocaleString()}
                                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && ' (edited)'}
                                </small>
                              </div>
                              {currentUser && currentUser.id === comment.user.id && (
                                <div>
                                  <Button 
                                    variant="link" 
                                    className="p-0 text-muted me-3" 
                                    onClick={() => handleEditComment(comment)}
                                  >
                                    <FaEdit />
                                  </Button>
                                  <Button 
                                    variant="link" 
                                    className="p-0 text-danger" 
                                    onClick={() => handleDeleteComment(comment.id)}
                                  >
                                    <FaTrashAlt />
                                  </Button>
                                </div>
                              )}
                            </div>
                            
                            {editingComment === comment.id ? (
                              <div>
                                <Form.Control
                                  as="textarea"
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  rows={2}
                                  className="mb-2"
                                />
                                <Button 
                                  size="sm" 
                                  variant="primary" 
                                  className="me-2" 
                                  onClick={() => handleUpdateComment(comment.id)}
                                >
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline-secondary" 
                                  onClick={() => setEditingComment(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div>{comment.content}</div>
                            )}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                  
                  {hasMoreComments && (
                    <div className="text-center mt-3">
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        onClick={() => fetchComments()}
                        disabled={commentLoading}
                      >
                        {commentLoading ? 'Loading...' : 'Load More Comments'}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted my-4">No comments yet. Be the first to comment!</p>
              )}
            </Card.Footer>
          </Card>
          
          <div className="mt-4 text-center">
            <Button as={Link} to="/" variant="outline-secondary">
              Back to Home
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PostDetail;
