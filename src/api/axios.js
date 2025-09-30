import axios from 'axios';

const api = axios.create(); // No baseURL

api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('adminToken');
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api;

