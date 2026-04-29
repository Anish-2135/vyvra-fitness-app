// frontend/src/services/api.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signupUser  = (data)  => api.post('/auth/signup', data);
export const loginUser   = (data)  => api.post('/auth/login',  data);

// Fitness
export const addFitnessEntry    = (data) => api.post('/fitness/add',     data);
export const getFitnessStats    = ()     => api.get('/fitness/stats');
export const getFitnessHistory  = ()     => api.get('/fitness/history');
export const getFitnessInsights = ()     => api.get('/fitness/insights');
export const updateFitnessEntry = (id, data) => api.put(`/fitness/${id}`,    data);
export const deleteFitnessEntry = (id)       => api.delete(`/fitness/${id}`);

export default api;