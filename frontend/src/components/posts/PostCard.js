import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { formatDistance } from 'date-fns';
import { IMAGE_BASE_URL } from '../../config';

const PostCard = ({ post, onLikeToggle }) => {
  // Format date as "X time ago"
  const timeAgo = formatDistance(
    new Date(post.createdAt),
    new Date(),
    { addSuffix: true }
  );

  // Handle proper image URL based on type (Base64 or file path)
  const getImageSrc = () => {
    if (!post.imageUrl) return null;
    return post.imageUrl.startsWith('data:') ? post.imageUrl : `${IMAGE_BASE_URL}${post.imageUrl}`;
  };

  return (
    <Card className="post-card mb-4 shadow-sm">
      {post.imageUrl && (
        <div className="post-image-container">
          <Card.Img 
            variant="top" 
            src={getImageSrc()}
            alt={post.imageName || 'Post image'} 
            className="post-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.classList.add('post-image-fallback');
              e.target.parentNode.innerHTML = '<div class="text-center p-3">Image not available</div>';
            }}
          />
        </div>
      )}
      
      <Card.Body>
        <div className="d-flex align-items-center mb-2">
          <img 
            src={post.user.profilePicture ? `${IMAGE_BASE_URL}${post.user.profilePicture}` : '/default-avatar.png'} 
            alt={post.user.username}
            className="avatar me-2"
            onError={(e) => { e.target.src = '/default-avatar.png'; }}
          />
          <div>
            <Link to={`/${post.user.username}`} className="text-decoration-none text-dark">
              <strong>{post.user.fullName || post.user.username}</strong>
            </Link>
            <p className="text-muted mb-0 small">{timeAgo}</p>
          </div>
        </div>
        
        <Card.Title as={Link} to={`/posts/${post.id}`} className="text-decoration-none text-dark">
          {post.title}
        </Card.Title>
        
        <Card.Text className="text-truncate-3">{post.content}</Card.Text>
        
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <Button 
              variant="link" 
              className="p-0 text-muted text-decoration-none me-3"
              onClick={() => onLikeToggle && onLikeToggle(post.id)}
            >
              {post.likedByCurrentUser ? (
                <FaHeart className="text-danger" />
              ) : (
                <FaRegHeart />
              )} 
              <span className="ms-1">{post.likeCount}</span>
            </Button>
            <Link to={`/posts/${post.id}`} className="text-muted text-decoration-none">
              <FaComment /> <span className="ms-1">{post.commentCount}</span>
            </Link>
          </div>
          
          <Link to={`/posts/${post.id}`} className="btn btn-sm btn-outline-primary">
            View Post
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PostCard;
