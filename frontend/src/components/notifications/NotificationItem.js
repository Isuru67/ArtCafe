import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { IMAGE_BASE_URL } from '../../config';

const NotificationItem = ({ notification, onClick }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <ListGroup.Item 
      action 
      as={Link} 
      to={notification.link || '#'}
      className={`d-flex align-items-center ${!notification.read ? 'bg-light' : ''}`}
      onClick={() => onClick(notification)}
    >
      <div className="me-2">
        {notification.sender?.profilePicture ? (
          <img 
            src={`${IMAGE_BASE_URL}${notification.sender.profilePicture}`}
            alt={notification.sender?.username || 'User'}
            className="avatar avatar-sm"
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'avatar-fallback avatar-sm';
              fallback.innerHTML = '<FaUser />';
              e.target.parentNode.appendChild(fallback);
            }}
          />
        ) : (
          <div className="avatar-fallback avatar-sm">
            <FaUser />
          </div>
        )}
      </div>
      <div className="flex-grow-1">
        <div className="notification-content" dangerouslySetInnerHTML={{ __html: notification.content }} />
        <small className="text-muted">{formatTime(notification.createdAt)}</small>
      </div>
      {!notification.read && (
        <div className="notification-badge-dot"></div>
      )}
    </ListGroup.Item>
  );
};

export default NotificationItem;
