// Base URL for API requests
export const API_BASE_URL = 'http://localhost:8080'; // Or your backend URL

// Base URL for images
export const IMAGE_BASE_URL = 'http://localhost:8080';

// API base URLs
const AUTH_BASE_URL = `${API_BASE_URL}/api/auth`;
const USERS_BASE_URL = `${API_BASE_URL}/api/users`;
const POSTS_BASE_URL = `${API_BASE_URL}/api/posts`;

// API endpoints
export const API_URLS = {
  // Auth endpoints
  login: `${AUTH_BASE_URL}/login`,
  signup: `${AUTH_BASE_URL}/signup`,
  
  // User endpoints
  getUserProfile: `${USERS_BASE_URL}/profile`,
  getUserById: (id) => `${USERS_BASE_URL}/${id}`,
  updateUserProfile: `${USERS_BASE_URL}/profile`,
  uploadProfilePicture: `${USERS_BASE_URL}/profile/picture`,
  changePassword: `${USERS_BASE_URL}/profile/change-password`,
  deleteAccount: `${USERS_BASE_URL}/profile`,
  checkUsername: `${USERS_BASE_URL}/check-username`,
  checkEmail: `${USERS_BASE_URL}/check-email`,
  
  // Post endpoints
  getPosts: `${POSTS_BASE_URL}`,
  getPostsByUsername: (username) => `${POSTS_BASE_URL}/byUsername/${username}`,
  getPostById: (id) => `${POSTS_BASE_URL}/${id}`,
  createPost: `${POSTS_BASE_URL}`,
  updatePost: (id) => `${POSTS_BASE_URL}/${id}`,
  deletePost: (id) => `${POSTS_BASE_URL}/${id}`,
  uploadPostImage: `${POSTS_BASE_URL}/upload-image`,
  toggleLike: (id) => `${POSTS_BASE_URL}/${id}/like`,
  
  // Comment endpoints
  getCommentsByPostId: (postId) => `${POSTS_BASE_URL}/${postId}/comments`,
  createComment: (postId) => `${POSTS_BASE_URL}/${postId}/comments`,
  updateComment: (postId, commentId) => `${POSTS_BASE_URL}/${postId}/comments/${commentId}`,
  deleteComment: (postId, commentId) => `${POSTS_BASE_URL}/${postId}/comments/${commentId}`,
};

export default API_URLS;
