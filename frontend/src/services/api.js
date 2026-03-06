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
                // dev debug removed
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    try {
      console.error('[api] response error', err.response?.status, err.response?.data);
      const status = err.response?.status;
      const data = err.response?.data;
      const message = data && typeof data === 'object' ? data.error : data;
      // If backend indicates user not authenticated or unauthorized, clear local auth and redirect to login
      if (status === 401 || status === 403 || (status === 400 && message && String(message).toLowerCase().includes('not authenticated'))) {
        try {
          authService.logout();
        } catch (e) {}
        window.location.href = '/login';
      }
    } catch (e) {}
    return Promise.reject(err);
  }
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
            return null;
        }
    }
};

export const manifestationService = {
    saveManifestation: (data) => api.post('/manifestations', data),
    getToday: () => api.get('/manifestations/today'),
    getAll: () => api.get('/manifestations'),
};

export const dreamService = {
    getDreams: () => api.get('/dreams'),
    getDream: (id) => api.get(`/dreams/${id}`),
    createDream: (dream) => api.post('/dreams', dream),
    updateDream: (id, dream) => api.put(`/dreams/${id}`, dream),
    deleteDream: (id) => api.delete(`/dreams/${id}`),
    getDailySelection: () => api.get('/dreams/daily'),
    getDailyFocusDream: () => api.get('/dreams/daily-focus'),
    suggestMilestones: (dreamTitle, dreamDescription) => api.post('/dreams/suggest-milestones', {
         dreamTitle,
         dreamDescription
    }),
    searchImages: (title, description, category, customQuery) => api.post('/dreams/search-images', {
        title,
        description,
        category,
        customQuery
    }),
    generateImage: (title, description) => api.post('/dreams/generate-image', {
        title,
        description
    }),
    // Vision Board
    generateVisionBoard: (forceRegenerate = false) => api.get('/dreams/vision-board/generate', {
        params: { forceRegenerate }
    }),
    clearVisionBoardCache: () => api.post('/dreams/vision-board/clear-cache'),
    // Milestone CRUD
    getMilestones: (dreamId) => api.get(`/dreams/${dreamId}/milestones`),
    getMilestone: (dreamId, milestoneId) => api.get(`/dreams/${dreamId}/milestones/${milestoneId}`),
    createMilestone: (dreamId, milestone) => api.post(`/dreams/${dreamId}/milestones`, milestone),
    updateMilestone: (dreamId, milestoneId, milestone) => api.put(`/dreams/${dreamId}/milestones/${milestoneId}`, milestone),
    deleteMilestone: (dreamId, milestoneId) => api.delete(`/dreams/${dreamId}/milestones/${milestoneId}`),
};

export const userService = {
    getProfile: () => api.get('/user/me'),
    getStreak: () => api.get('/user/streak'),
    updateStreak: (payload) => api.post('/user/streak/update', payload),
    getAnalytics: () => api.get('/user/analytics'),
};

export const futureLetterService = {
    getLetter: () => api.get('/future-letter'),
    saveLetter: (content) => api.post('/future-letter', { content }),
    updateLetter: (content) => api.put('/future-letter', { content }),
};

export const gratitudeService = {
    getTodayStatus: () => api.get('/gratitude/today'),
    submitGratitude: (data) => api.post('/gratitude', data),
    getHistory: () => api.get('/gratitude/history'),
    hasCompletedToday: () => api.get('/gratitude/completed-today'),
};

export default api;
