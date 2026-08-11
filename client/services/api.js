

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json' // 👈 תוקן מ-'json' ל-'application/json'
  }
});

// Interceptor להוספת הטוקן לכל בקשה יוצאת (לנתיבים מוגנים)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// פונקציות לאימות משתמשים (Auth)
export const loginUser = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  if (res.data.token) {
    localStorage.setItem('token', res.data.token);
  }
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await api.post('/auth/register', userData);
  if (res.data.token) {
    localStorage.setItem('token', res.data.token);
  }
  return res.data;
};

// פונקציות לסיפורים (Stories)
export const getStories = async () => {
  const res = await api.get('/stories');
  return res.data;
};

export const createStory = async (storyData) => {
  const res = await api.post('/stories', storyData);
  return res.data;
};

export default api;