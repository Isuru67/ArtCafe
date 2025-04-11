import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUser, FaCircle } from 'react-icons/fa';
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
      className={`d-flex align-items-center py-3 px-3 border-left-0 border-right-0`}
      onClick={() => onClick(notification)}
      style={{
        borderLeft: notification.read ? 'none' : '4px solid #e74c3c',
        backgroundColor: notification.read ? 'white' : '#fff5f5',
        transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = notification.read ? '#f8f9fa' : '#ffe8e8'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = notification.read ? 'white' : '#fff5f5'}
    >
      <div className="me-3">
        {notification.sender?.profilePicture ? (
          <img 
            src={`${IMAGE_BASE_URL}${notification.sender.profilePicture}`}
            alt={notification.sender?.username || 'User'}
            className="avatar avatar-sm"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #e0e0e0'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'avatar-fallback avatar-sm';
              fallback.innerHTML = '<FaUser />';
              e.target.parentNode.appendChild(fallback);
            }}
          />
        ) : (
          <div className="avatar-fallback avatar-sm" style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#757575'
          }}>
            <FaUser />
          </div>
        )}
      </div>
      <div className="flex-grow-1">
        <div 
          className="notification-content" 
          dangerouslySetInnerHTML={{ __html: notification.content }}
          style={{
            color: '#333',
            fontSize: '14px'
          }} 
        />
        <small className="text-muted" style={{ fontSize: '12px' }}>{formatTime(notification.createdAt)}</small>
      </div>
      {!notification.read && (
        <div className="ms-2">
          <FaCircle size={8} style={{ color: '#e74c3c' }} />
        </div>
      )}
    </ListGroup.Item>
  );
};

export default NotificationItem;
