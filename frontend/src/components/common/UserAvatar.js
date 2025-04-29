import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { IMAGE_BASE_URL } from '../../config';

const UserAvatar = ({ user, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClass = size === 'sm' ? 'avatar-sm' : '';
  const avatarClass = `avatar ${sizeClass} ${className}`;

  if (!user?.profilePicture || imageError) {
    return (
      <div className={`${avatarClass} avatar-fallback`}>
        <FaUser />
      </div>
    );
  }

  return (
    <img
      src={`${IMAGE_BASE_URL}${user.profilePicture}`}
      alt={user.username || 'User'}
      className={avatarClass}
      onError={() => setImageError(true)}
    />
  );
};

export default UserAvatar;
