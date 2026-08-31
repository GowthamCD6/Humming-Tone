import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.warn(`API [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      console.warn(`API Network Error: Could not reach ${API_BASE_URL}${error.config?.url || ''}. Check backend server and DEV_DEVICE_IP.`);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
