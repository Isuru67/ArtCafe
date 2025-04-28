import axios from "axios";
import authHeader from "../utils/authHeader";

const API_URL = "http://localhost:8080/api/learning-plans"; // Backend URL

// Create a new learning plan
export const createLearningPlan = (userId, planData) => {
    return axios.post(`${API_URL}/${userId}`, planData, { headers: authHeader() });
};

// Get all plans for user
export const getLearningPlans = (userId) => {
    return axios.get(`${API_URL}/${userId}`, { headers: authHeader() });
};

// Update a plan
export const updateLearningPlan = (planId, planData) => {
    return axios.put(`${API_URL}/${planId}`, planData, { headers: authHeader() });
};

// Delete a plan
export const deleteLearningPlan = (planId) => {
    return axios.delete(`${API_URL}/${planId}`, { headers: authHeader() });
};

// Mark topic completed
export const completeTopic = (topicId) => {
    return axios.put(`${API_URL}/topics/${topicId}/complete`, {}, { headers: authHeader() });
};
