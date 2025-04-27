import axios from 'axios';
import { API_URLS } from '../config';

// Get all posts with pagination
export const getPosts = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_URLS.getPosts}?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Get a single post by ID
export const getPostById = async (postId) => {
  try {
    const response = await axios.get(API_URLS.getPostById(postId));
    return response.data;
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error);
    throw error;
  }
};

// Create a new post
export const createPost = async (postData) => {
  try {
    const response = await axios.post(API_URLS.createPost, postData);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Update an existing post
export const updatePost = async (postId, postData) => {
  try {
    const response = await axios.put(API_URLS.updatePost(postId), postData);
    return response.data;
  } catch (error) {
    console.error(`Error updating post ${postId}:`, error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId) => {
  try {
    const response = await axios.delete(API_URLS.deletePost(postId));
    return response.data;
  } catch (error) {
    console.error(`Error deleting post ${postId}:`, error);
    throw error;
  }
};

// Upload an image for a post
export const uploadPostImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(API_URLS.uploadPostImage, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Toggle like on a post
export const toggleLike = async (postId) => {
  try {
    const response = await axios.post(API_URLS.toggleLike(postId));
    return response.data;
  } catch (error) {
    console.error(`Error toggling like on post ${postId}:`, error);
    throw error;
  }
};

// Get comments for a post
export const getCommentsByPostId = async (postId, page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_URLS.getCommentsByPostId(postId)}?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (postId, content) => {
  try {
    const response = await axios.post(API_URLS.createComment(postId), { content });
    return response.data;
  } catch (error) {
    console.error(`Error adding comment to post ${postId}:`, error);
    throw error;
  }
};

// Update a comment
export const updateComment = async (postId, commentId, content) => {
  try {
    const response = await axios.put(API_URLS.updateComment(postId, commentId), { content });
    return response.data;
  } catch (error) {
    console.error(`Error updating comment ${commentId}:`, error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (postId, commentId) => {
  try {
    const response = await axios.delete(API_URLS.deleteComment(postId, commentId));
    return response.data;
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    throw error;
  }
};

export default {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  uploadPostImage,
  toggleLike,
  getCommentsByPostId,
  addComment,
  updateComment,
  deleteComment
};
