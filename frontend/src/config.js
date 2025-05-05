// Configuration settings for the ArtCafe frontend

// API base URL
export const API_BASE_URL = 'http://localhost:8080';

// Base URL for image paths - make sure this points to your API server
export const IMAGE_BASE_URL = 'http://localhost:8080';  // Updated to include full server URL

// For production deployment, you might want to set absolute URLs
// export const IMAGE_BASE_URL = 'http://your-domain.com';

// Maximum upload size for images (in bytes)
export const MAX_IMAGE_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

// Supported image formats
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// API endpoints
export const API_URLS = {
  // Auth endpoints
  login: `${API_BASE_URL}/api/auth/login`,
  signup: `${API_BASE_URL}/api/auth/signup`,
  
  // User endpoints
  getUserProfile: `${API_BASE_URL}/api/users/me`,
  getUserById: (id) => `${API_BASE_URL}/api/users/${id}`,
  updateUserProfile: `${API_BASE_URL}/api/users/update`,
  uploadProfilePicture: `${API_BASE_URL}/api/users/upload-profile-picture`,
  changePassword: `${API_BASE_URL}/api/users/change-password`,
  deleteAccount: `${API_BASE_URL}/api/users/delete`,
  checkUsername: `${API_BASE_URL}/api/users/check-username`,
  checkEmail: `${API_BASE_URL}/api/users/check-email`,
  
  // Post endpoints
  getPosts: `${API_BASE_URL}/api/posts`,
  getPostsByUsername: (username) => `${API_BASE_URL}/api/posts/byUsername/${username}`,
  getPostById: (id) => `${API_BASE_URL}/api/posts/${id}`,
  createPost: `${API_BASE_URL}/api/posts`,
  updatePost: (id) => `${API_BASE_URL}/api/posts/${id}`,
  deletePost: (id) => `${API_BASE_URL}/api/posts/${id}`,
  uploadPostImage: `${API_BASE_URL}/api/posts/upload-image`,
  toggleLike: (id) => `${API_BASE_URL}/api/posts/${id}/like`,
  
  // Comment endpoints
  getCommentsByPostId: (postId) => `${API_BASE_URL}/api/posts/${postId}/comments`,
  createComment: (postId) => `${API_BASE_URL}/api/posts/${postId}/comments`,
  updateComment: (postId, commentId) => `${API_BASE_URL}/api/posts/${postId}/comments/${commentId}`,
  deleteComment: (postId, commentId) => `${API_BASE_URL}/api/posts/${postId}/comments/${commentId}`,
};

export default API_URLS;
