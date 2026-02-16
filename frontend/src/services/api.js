import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
};

export const visionBoardAPI = {
  getUserVisionBoards: () => api.get('/vision-boards'),
  createVisionBoard: (data) => api.post('/vision-boards', data),
  getVisionBoard: (id) => api.get(`/vision-boards/${id}`),
  updateVisionBoard: (id, data) => api.put(`/vision-boards/${id}`, data),
  deleteVisionBoard: (id) => api.delete(`/vision-boards/${id}`),
  addCanvasElement: (boardId, element) => api.post(`/vision-boards/${boardId}/elements`, element),
  updateCanvasElement: (boardId, elementId, element) => api.put(`/vision-boards/${boardId}/elements/${elementId}`, element),
  deleteCanvasElement: (boardId, elementId) => api.delete(`/vision-boards/${boardId}/elements/${elementId}`),
};

export const playerStatsAPI = {
  getPlayerStats: () => api.get('/player-stats'),
  gainXP: (amount, reason) => api.post('/player-stats/gain-xp', { amount, reason }),
  completeChallenge: (challengeId) => api.post(`/player-stats/complete-challenge/${challengeId}`),
  completeGoal: (goalId) => api.post(`/player-stats/complete-goal/${goalId}`),
  completeQuest: (questId) => api.post(`/player-stats/complete-quest/${questId}`),
  completeTask: (taskId) => api.post(`/player-stats/complete-task/${taskId}`),
  updateStreak: () => api.post('/player-stats/update-streak'),
};

export const goalsAPI = {
  getUserGoals: () => api.get('/goals'),
  createGoal: (goal) => api.post('/goals', goal),
  updateGoal: (id, goal) => api.put(`/goals/${id}`, goal),
  deleteGoal: (id) => api.delete(`/goals/${id}`),
};

export const questsAPI = {
  getUserQuests: () => api.get('/quests'),
  createQuest: (quest) => api.post('/quests', quest),
  updateQuest: (id, quest) => api.put(`/quests/${id}`, quest),
  deleteQuest: (id) => api.delete(`/quests/${id}`),
};

export const tasksAPI = {
  getUserTasks: () => api.get('/tasks'),
  createTask: (task) => api.post('/tasks', task),
  updateTask: (id, task) => api.put(`/tasks/${id}`, task),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const habitsAPI = {
  getUserHabits: () => api.get('/habits'),
  createHabit: (habit) => api.post('/habits', habit),
  updateHabit: (id, habit) => api.put(`/habits/${id}`, habit),
  deleteHabit: (id) => api.delete(`/habits/${id}`),
  logHabit: (habitId, date) => api.post(`/habits/${habitId}/log`, { date }),
};

export default api;
