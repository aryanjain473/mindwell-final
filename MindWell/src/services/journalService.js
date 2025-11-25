import api from '../utils/axiosConfig';

export const journalService = {
  // Get all journal entries
  getJournals: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/journal?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching journals:', error);
      throw error;
    }
  },

  // Get today's journal entry
  getTodaysJournal: async () => {
    try {
      const response = await api.get('/journal/today');
      return response.data;
    } catch (error) {
      console.error('Error fetching today\'s journal:', error);
      throw error;
    }
  },

  // Get journal by date
  getJournalByDate: async (date) => {
    try {
      const response = await api.get(`/journal/date/${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching journal by date:', error);
      throw error;
    }
  },

  // Create a new journal entry
  createJournal: async (journalData) => {
    try {
      const response = await api.post('/journal', journalData);
      return response.data;
    } catch (error) {
      console.error('Error creating journal:', error);
      throw error;
    }
  },

  // Update a journal entry
  updateJournal: async (id, journalData) => {
    try {
      const response = await api.put(`/journal/${id}`, journalData);
      return response.data;
    } catch (error) {
      console.error('Error updating journal:', error);
      throw error;
    }
  },

  // Delete a journal entry
  deleteJournal: async (id) => {
    try {
      const response = await api.delete(`/journal/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting journal:', error);
      throw error;
    }
  },

  // Search journal entries
  searchJournals: async (query, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/journal/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error searching journals:', error);
      throw error;
    }
  },

  // Get journal statistics
  getJournalStats: async () => {
    try {
      const response = await api.get('/journal/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching journal stats:', error);
      throw error;
    }
  }
};

export default journalService;
