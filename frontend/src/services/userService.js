import axios from 'axios';
import { API_URLS } from '../config';

// Get current user's profile
export const getUserProfile = async () => {
  try {
    const response = await axios.get(API_URLS.getUserProfile);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Get user profile by ID
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(API_URLS.getUserById(userId));
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await axios.put(API_URLS.updateUserProfile, profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Upload profile picture
export const uploadProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(API_URLS.uploadProfilePicture, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await axios.put(API_URLS.changePassword, passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Delete user account
export const deleteAccount = async () => {
  try {
    const response = await axios.delete(API_URLS.deleteAccount);
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

// Check if username is available
export const checkUsernameAvailability = async (username) => {
  try {
    const response = await axios.get(`${API_URLS.checkUsername}?username=${encodeURIComponent(username)}`);
    return response.data;
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw error;
  }
};

// Check if email is available
export const checkEmailAvailability = async (email) => {
  try {
    const response = await axios.get(`${API_URLS.checkEmail}?email=${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    console.error('Error checking email availability:', error);
    throw error;
  }
};

// Register new user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(API_URLS.signup, userData);
    return response.data;
  } catch (error) {
    console.error('Error registering new user:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (usernameOrEmail, password) => {
  try {
    const response = await axios.post(API_URLS.login, {
      usernameOrEmail,
      password
    });
    
    // Set the JWT token in axios headers for future requests
    if (response.data.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export default {
  getUserProfile,
  getUserById,
  updateUserProfile,
  uploadProfilePicture,
  changePassword,
  deleteAccount,
  checkUsernameAvailability,
  checkEmailAvailability,
  registerUser,
  loginUser
};
