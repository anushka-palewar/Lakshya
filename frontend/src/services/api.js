import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const authService = {
    signup: async (userData) => {
        const response = await api.post('/auth/signup', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            // The backend sends 'username' in AuthResponse
            localStorage.setItem('user', JSON.stringify(response.data.username || userData.username));
        }
        return response.data;
    },
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            // The backend sends 'username' in AuthResponse
            localStorage.setItem('user', JSON.stringify(response.data.username || credentials.username));
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        if (!user || user === 'undefined') return null;
        try {
            return JSON.parse(user);
        } catch (e) {
            console.error('Error parsing user from localStorage', e);
            return null;
        }
    }
};

export default api;
