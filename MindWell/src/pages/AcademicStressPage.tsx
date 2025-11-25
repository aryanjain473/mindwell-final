import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Calendar, Target, Lightbulb, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import AcademicStressCheck from '../components/stress/AcademicStressCheck';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StressStats {
  streak: number;
  latestScore: number | null;
  latestCheck: string | null;
  recentPatterns?: unknown[];
}

interface StressHistoryItem {
  stressScore: number;
  workload: number;
  deadlines: number;
  concentration: number;
  sleep: number;
  emotionTags?: string[];
  createdAt: string;
}

interface StressPatterns {
  stressTrend?: {
    direction: string;
    change: number;
  };
  sleepConcentrationCorrelation?: {
    significant: boolean;
    correlationStrength: number;
  };
  recommendations?: Array<{
    title: string;
    message: string;
    action: string;
  }>;
}

const AcademicStressPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'check' | 'history' | 'patterns'>('check');
  const [stats, setStats] = useState<StressStats | null>(null);
  const [history, setHistory] = useState<StressHistoryItem[]>([]);
  const [patterns, setPatterns] = useState<StressPatterns | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, historyRes, patternsRes] = await Promise.all([
        api.get('/stress/stats'),
        api.get('/stress/history'),
        api.get('/stress/patterns')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (historyRes.data.success) {
        setHistory(historyRes.data.data.history);
      }
      if (patternsRes.data.success && patternsRes.data.data.patterns) {
        setPatterns(patternsRes.data.data.patterns);
      }
    } catch (error) {
      console.error('Error fetching stress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStressColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-green-600';
  };

  // Prepare chart data
  const chartData = history.slice(0, 14).reverse().map((log: StressHistoryItem) => ({
    date: formatDate(log.createdAt),
    stress: log.stressScore,
    workload: log.workload * 10,
    deadlines: log.deadlines * 10,
    concentration: log.concentration * 10,
    sleep: log.sleep * 10
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Academic Stress Management</h1>
                <p className="text-sm text-gray-600">Track and manage your academic stress</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Stress Score</p>
                  <p className={`text-3xl font-bold ${getStressColor(stats.latestScore || 0)}`}>
                    {stats.latestScore || '--'}/100
                  </p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Target className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Check-in Streak</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.streak || 0} days</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Flame className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Check-in</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stats.latestCheck
                      ? formatDate(stats.latestCheck)
                      : 'Never'}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'check', label: 'Take Check', icon: Target },
                { id: 'history', label: 'History', icon: Calendar },
                { id: 'patterns', label: 'Patterns', icon: Lightbulb }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'check' | 'history' | 'patterns')}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Stress Check Tab */}
            {activeTab === 'check' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AcademicStressCheck />
              </motion.div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No stress check history yet</p>
                    <p className="text-sm text-gray-500">Take your first stress check to see your progress</p>
                  </div>
                ) : (
                  <>
                    {/* Chart */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Stress Trend (Last 14 Days)</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="stress"
                            stroke="#14b8a6"
                            strokeWidth={2}
                            name="Stress Score"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* History List */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Checks</h3>
                      {history.slice(0, 10).map((log: StressHistoryItem, index: number) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStressColor(log.stressScore)} bg-opacity-10`}>
                                {log.stressScore}/100
                              </div>
                              <span className="text-sm text-gray-600">{formatDate(log.createdAt)}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Workload</p>
                              <p className="font-semibold text-gray-900">{log.workload}/10</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Deadlines</p>
                              <p className="font-semibold text-gray-900">{log.deadlines}/10</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Concentration</p>
                              <p className="font-semibold text-gray-900">{log.concentration}/10</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Sleep</p>
                              <p className="font-semibold text-gray-900">{log.sleep}/10</p>
                            </div>
                          </div>
                          {log.emotionTags && log.emotionTags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {log.emotionTags.map((emotion: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {emotion}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Patterns Tab */}
            {activeTab === 'patterns' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {!patterns ? (
                  <div className="text-center py-12">
                    <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Not enough data for pattern detection</p>
                    <p className="text-sm text-gray-500">Complete at least 3 stress checks to see patterns</p>
                  </div>
                ) : (
                  <>
                    {/* Stress Trend */}
                    {patterns.stressTrend && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-primary-600" />
                          <span>Stress Trend</span>
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Trend Direction</span>
                            <span className={`font-semibold ${
                              patterns.stressTrend.direction === 'increasing' ? 'text-red-600' :
                              patterns.stressTrend.direction === 'decreasing' ? 'text-green-600' :
                              'text-gray-600'
                            }`}>
                              {patterns.stressTrend.direction.charAt(0).toUpperCase() + patterns.stressTrend.direction.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Change</span>
                            <span className="font-semibold text-gray-900">
                              {patterns.stressTrend.change > 0 ? '+' : ''}{patterns.stressTrend.change} points
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Correlations */}
                    {patterns.sleepConcentrationCorrelation && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sleep & Concentration</h3>
                        <p className="text-gray-600 mb-4">
                          {patterns.sleepConcentrationCorrelation.significant
                            ? `We found a strong correlation: when your sleep is poor, your concentration tends to drop.`
                            : `No significant correlation detected between sleep and concentration.`}
                        </p>
                        <div className="text-sm text-gray-500">
                          Correlation strength: {patterns.sleepConcentrationCorrelation.correlationStrength}%
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {patterns.recommendations && patterns.recommendations.length > 0 && (
                      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-primary-900 mb-4">Personalized Recommendations</h3>
                        <div className="space-y-4">
                          {patterns.recommendations.map((rec, index: number) => (
                            <div key={index} className="bg-white rounded-lg p-4">
                              <div className="flex items-start space-x-3">
                                <Lightbulb className="h-5 w-5 text-primary-600 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                                  <p className="text-sm text-gray-600 mb-2">{rec.message}</p>
                                  <p className="text-sm text-primary-600 font-medium">{rec.action}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicStressPage;

