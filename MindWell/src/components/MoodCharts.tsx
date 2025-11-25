import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface MoodData {
  date: string;
  mood: number;
  activities: string[];
}

interface ChartProps {
  moodHistory: MoodData[];
  timeRange: '7d' | '30d';
}

const MoodCharts: React.FC<ChartProps> = ({ moodHistory, timeRange }) => {
  // Process data for different charts
  const lineChartData = moodHistory.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: item.mood,
    activities: item.activities.length
  }));

  // Weekly average data for bar chart
  const weeklyData = React.useMemo(() => {
    const weeks: { [key: string]: { mood: number; count: number } } = {};
    
    moodHistory.forEach(item => {
      const date = new Date(item.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { mood: 0, count: 0 };
      }
      weeks[weekKey].mood += item.mood;
      weeks[weekKey].count += 1;
    });

    return Object.entries(weeks).map(([week, data]) => ({
      week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      averageMood: Math.round((data.mood / data.count) * 10) / 10,
      totalLogs: data.count
    }));
  }, [moodHistory]);

  // Mood distribution for pie chart
  const moodDistribution = React.useMemo(() => {
    const distribution = { positive: 0, neutral: 0, negative: 0 };
    
    moodHistory.forEach(item => {
      if (item.mood >= 7) distribution.positive++;
      else if (item.mood >= 4) distribution.neutral++;
      else distribution.negative++;
    });

    return [
      { name: 'Positive (7-10)', value: distribution.positive, color: '#10b981' },
      { name: 'Neutral (4-6)', value: distribution.neutral, color: '#f59e0b' },
      { name: 'Negative (1-3)', value: distribution.negative, color: '#ef4444' }
    ];
  }, [moodHistory]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-teal-600">
            Mood: <span className="font-semibold">{payload[0].value}</span>
          </p>
          {payload[1] && (
            <p className="text-blue-600">
              Activities: <span className="font-semibold">{payload[1].value}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mb-8">
      {/* Line Chart - Mood Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          📈 Mood Trends ({timeRange === '7d' ? '7 Days' : '30 Days'})
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={lineChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              domain={[0, 10]}
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="#14b8a6"
              strokeWidth={3}
              dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#14b8a6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bar Chart - Weekly Averages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          📊 Weekly Mood Averages
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="week" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              domain={[0, 10]}
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-medium text-gray-900">{label}</p>
                      <p className="text-teal-600">
                        Avg Mood: <span className="font-semibold">{payload[0].value}</span>
                      </p>
                      <p className="text-blue-600">
                        Total Logs: <span className="font-semibold">{payload[1]?.value || 0}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="averageMood" 
              fill="#14b8a6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Pie Chart - Mood Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 lg:col-span-2"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          🍩 Mood Distribution
        </h3>
        <div className="flex flex-col xl:flex-row items-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={moodDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {moodDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900">{data.name}</p>
                        <p className="text-gray-600">
                          Count: <span className="font-semibold">{data.value}</span>
                        </p>
                        <p className="text-gray-600">
                          Percentage: <span className="font-semibold">
                            {Math.round((data.value / moodHistory.length) * 100)}%
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 lg:mt-0 lg:ml-8">
            <div className="space-y-2">
              {moodDistribution.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-700">
                    {item.name}: {item.value} ({Math.round((item.value / moodHistory.length) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MoodCharts;
