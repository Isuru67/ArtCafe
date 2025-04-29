import axios from 'axios';
import { API_BASE_URL } from '../config';

// Get notifications with pagination
export const getNotifications = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/notifications?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/notifications/read-all`);
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/notifications/unread-count`);
    return response.data;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    throw error;
  }
};

// Clear all read notifications
export const clearReadNotifications = async () => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/notifications/clear-read`);
    return response.data;
  } catch (error) {
    console.error('Error clearing read notifications:', error);
    throw error;
  }
};
