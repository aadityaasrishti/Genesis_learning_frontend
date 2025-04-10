import axios from 'axios';

const API_BASE_URL = '/api';
const MAX_RETRIES = import.meta.env.VITE_MAX_RETRIES || 3;
const TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 20000;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: TIMEOUT,
  withCredentials: import.meta.env.VITE_SECURE_COOKIES || true,
  proxy: false,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (!config || !error.response || error.response.status === 401) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('Authentication required'));
      }
      return Promise.reject(error);
    }

    if (
      (error.response.status >= 500 || error.code === 'ECONNABORTED') &&
      config.__retryCount < MAX_RETRIES
    ) {
      config.__retryCount = config.__retryCount || 0;
      config.__retryCount += 1;

      const backoff = Math.min(1000 * (Math.pow(2, config.__retryCount) - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, backoff));
      
      return apiClient(config);
    }

    return Promise.reject(error);
  }
);

export default apiClient;