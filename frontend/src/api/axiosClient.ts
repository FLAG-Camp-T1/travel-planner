import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosClient.interceptors.response.use(
  (response) => {
    const res = response.data;

    if (res.success) {
      return res.data;
    } else {
      console.error('API Error:', res.message);
      return Promise.reject(new Error(res.message || 'Backend API Error'));
    }
  },
  (error) => {
    const errorMsg = error.response?.data?.message || error.message;
    console.error('HTTP level error:', errorMsg);
    return Promise.reject(new Error(errorMsg));
  },
);

export default axiosClient;
