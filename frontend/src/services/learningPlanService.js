import axios from "axios";
import authHeader from "../utils/authHeader";

const API_URL = "http://localhost:8080/api/learning-plans";

export const getLearningPlans = (userId) => {
  return axios.get(`${API_URL}/${userId}`, { headers: authHeader() });
};

export const createLearningPlan = (userId, plan) => {
  return axios.post(`${API_URL}/${userId}`, plan, { headers: authHeader() });
};

export const updateLearningPlan = (planId, plan) => {
  return axios.put(`${API_URL}/${planId}`, plan, { headers: authHeader() });
};

export const deleteLearningPlan = (planId) => {
  return axios.delete(`${API_URL}/${planId}`, { headers: authHeader() });
};

export const completeTopic = (topicId) => {
  return axios.put(`${API_URL}/topics/${topicId}/complete`, {}, { headers: authHeader() });
};

// ✅ ADD THIS FUNCTION:
export const getLearningPlanById = (planId) => {
  return axios.get(`${API_URL}/single/${planId}`, { headers: authHeader() });
};
