// API base URLs
const API_BASE_URL = 'http://localhost:8080/api';
const AUTH_BASE_URL = `${API_BASE_URL}/auth`;
const USERS_BASE_URL = `${API_BASE_URL}/users`;
const POSTS_BASE_URL = `${API_BASE_URL}/posts`;

// Image base URL
export const IMAGE_BASE_URL = 'http://localhost:8080';

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
