import api from '../utils/axiosConfig';

export const habitsService = {
  // Get all habits
  getHabits: async () => {
    try {
      const response = await api.get('/habits');
      return response.data;
    } catch (error) {
      console.error('Error fetching habits:', error);
      throw error;
    }
  },

  // Get habit statistics
  getHabitStats: async () => {
    try {
      const response = await api.get('/habits/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching habit stats:', error);
      throw error;
    }
  },

  // Create a new habit
  createHabit: async (habitData) => {
    try {
      const response = await api.post('/habits', habitData);
      return response.data;
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  },

  // Update a habit
  updateHabit: async (id, habitData) => {
    try {
      const response = await api.put(`/habits/${id}`, habitData);
      return response.data;
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  },

  // Delete a habit
  deleteHabit: async (id) => {
    try {
      const response = await api.delete(`/habits/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  },

  // Toggle habit completion
  toggleCompletion: async (habitId, date, completed, notes = '') => {
    try {
      const response = await api.post(`/habits/${habitId}/toggle`, {
        date,
        completed,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      throw error;
    }
  },

  // Get completion status for a specific date
  getCompletionStatus: async (habitId, date) => {
    try {
      const response = await api.get(`/habits/${habitId}/status/${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching completion status:', error);
      throw error;
    }
  }
};

export default habitsService;







