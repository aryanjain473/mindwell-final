import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Calendar, 
  Filter,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  CloudFog,
  Zap
} from 'lucide-react';
import journalService from '../services/journalService';
import JournalEditor from '../components/JournalEditor';
import JournalEntry from '../components/JournalEntry';
import JournalStats from '../components/JournalStats';
import ScrollToTopButton from '../components/ScrollToTopButton';
import MobileOptimizedLayout from '../components/MobileOptimizedLayout';

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  mood: number;
  tags: string[];
  weather: string;
  activities: string[];
  gratitude: string[];
  goals: string[];
  reflection: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

const JournalPage = () => {
  const { user } = useAuth();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<any>(null);

  const weatherIcons = {
    sunny: Sun,
    cloudy: Cloud,
    rainy: CloudRain,
    snowy: Snowflake,
    windy: Wind,
    foggy: CloudFog,
    stormy: Zap
  };

  // Scroll to top when component mounts or dependencies change
  useScrollToTop([currentPage, filterMood]);

  useEffect(() => {
    fetchJournals();
    fetchStats();
  }, [currentPage, filterMood]);

  const fetchJournals = async () => {
    try {
      setIsLoading(true);
      const response = await journalService.getJournals(currentPage, 10);
      setJournals(response.data);
      setTotalPages(Math.ceil(response.pagination.total / 10));
    } catch (error) {
      console.error('Error fetching journals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await journalService.getJournalStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching journal stats:', error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  const handleCreateJournal = () => {
    setEditingJournal(null);
    setShowEditor(true);
    scrollToTop();
  };

  const handleEditJournal = (journal: JournalEntry) => {
    setEditingJournal(journal);
    setShowEditor(true);
    scrollToTop();
  };

  const handleDeleteJournal = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      try {
        await journalService.deleteJournal(id);
        fetchJournals();
        fetchStats();
      } catch (error) {
        console.error('Error deleting journal:', error);
      }
    }
  };

  const handleSaveJournal = async (journalData: any) => {
    try {
      if (editingJournal) {
        await journalService.updateJournal(editingJournal._id, journalData);
      } else {
        await journalService.createJournal(journalData);
      }
      setShowEditor(false);
      setEditingJournal(null);
      fetchJournals();
      fetchStats();
    } catch (error) {
      console.error('Error saving journal:', error);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        setIsLoading(true);
        const response = await journalService.searchJournals(searchQuery);
        setJournals(response.data);
      } catch (error) {
        console.error('Error searching journals:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      fetchJournals();
    }
  };

  const filteredJournals = filterMood 
    ? journals.filter(journal => journal.mood === filterMood)
    : journals;

  return (
    <MobileOptimizedLayout currentPage="journal">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl mr-4">
              <BookOpen className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Daily Journal</h1>
              <p className="text-gray-600 mt-2">Reflect on your day and track your journey</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <JournalStats stats={stats} />
          </motion.div>
        )}

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search your journals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterMood || ''}
                  onChange={(e) => setFilterMood(e.target.value ? parseInt(e.target.value) : null)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Moods</option>
                  <option value="1">😞 Very Low (1)</option>
                  <option value="2">😔 Low (2)</option>
                  <option value="3">😐 Low-Medium (3)</option>
                  <option value="4">😐 Medium-Low (4)</option>
                  <option value="5">😐 Medium (5)</option>
                  <option value="6">🙂 Medium-High (6)</option>
                  <option value="7">😊 High (7)</option>
                  <option value="8">😄 Very High (8)</option>
                  <option value="9">😁 Excellent (9)</option>
                  <option value="10">🤩 Perfect (10)</option>
                </select>
              </div>

              <button
                onClick={handleCreateJournal}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                New Entry
              </button>
            </div>
          </div>
        </motion.div>

        {/* Journal Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredJournals.length > 0 ? (
            filteredJournals.map((journal, index) => (
              <motion.div
                key={journal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <JournalEntry
                  journal={journal}
                  onEdit={handleEditJournal}
                  onDelete={handleDeleteJournal}
                  weatherIcons={weatherIcons}
                />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No journal entries found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'Try adjusting your search terms' : 'Start your journaling journey today!'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreateJournal}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Write Your First Entry
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mt-8"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Journal Editor Modal */}
      {showEditor && (
        <JournalEditor
          journal={editingJournal}
          onSave={handleSaveJournal}
          onClose={() => {
            setShowEditor(false);
            setEditingJournal(null);
          }}
          weatherIcons={weatherIcons}
        />
      )}

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
      </div>
    </MobileOptimizedLayout>
  );
};

export default JournalPage;
