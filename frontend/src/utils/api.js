import axios from 'axios';

const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (url.endsWith('/api') || url.endsWith('/api/')) return url;
  return url.endsWith('/') ? `${url}api` : `${url}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — attempt refresh token then retry
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => refreshSubscribers.forEach((cb) => cb(token));
const addSubscriber  = (cb) => refreshSubscribers.push(cb);

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }
      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post(
          `${getBaseURL()}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );
        const newToken = res.data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        if (res.data.data.refreshToken)
          localStorage.setItem('refreshToken', res.data.data.refreshToken);
        onRefreshed(newToken);
        refreshSubscribers = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default api;
