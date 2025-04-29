import axios from 'axios';
import { API_BASE_URL } from '../config';

// Get all posts with pagination
export const getAllPosts = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/posts?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Alias for getAllPosts to maintain compatibility with existing code
export const getPosts = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/posts?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Get posts by username with pagination
export const getPostsByUsername = async (username, page = 0, size = 10) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/posts/byUsername/${username}?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts for user ${username}:`, error);
    throw error;
  }
};

// Get a single post by ID
export const getPostById = async (id) => {
  try {
    console.log(`Fetching post with ID: ${id}`);
    const response = await axios.get(`${API_BASE_URL}/api/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    throw error;
  }
};

// Create a new post
export const createPost = async (formData, username) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/posts`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Update an existing post
export const updatePost = async (id, postData, isFormData = false) => {
  try {
    let config = {};
    
    // If sending FormData, set the content type header correctly
    if (isFormData) {
      config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
    }
    
    const response = await axios.put(`${API_BASE_URL}/api/posts/${id}`, postData, config);
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting post ${id}:`, error);
    throw error;
  }
};

// Toggle like on a post
export const toggleLike = async (id) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/posts/${id}/like`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling like for post ${id}:`, error);
    throw error;
  }
};

// Get comments for a post
export const getCommentsByPostId = async (postId, page = 0, size = 10) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/posts/${postId}/comments?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (postId, content) => {
  try {
    // Fix: Ensure we're sending the content in the correct format the backend expects
    const response = await axios.post(
      `${API_BASE_URL}/api/posts/${postId}/comments`, 
      { content }
    );
    return response.data;
  } catch (error) {
    console.error(`Error adding comment to post ${postId}:`, error);
    throw error;
  }
};

// Update a comment
export const updateComment = async (postId, commentId, content) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/posts/${postId}/comments/${commentId}`,
      { content }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating comment ${commentId}:`, error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (postId, commentId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/posts/${postId}/comments/${commentId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    throw error;
  }
};

export default {
  getAllPosts,
  getPosts,
  getPostsByUsername,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  getCommentsByPostId,
  addComment,
  updateComment,
  deleteComment
};
