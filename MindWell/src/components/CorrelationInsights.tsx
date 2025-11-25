import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Brain, 
  Heart,
  Zap,
  Lightbulb,
  BarChart3
} from 'lucide-react';

interface ActivityData {
  date: string;
  mood: number;
  notes: string;
  activities: string[];
  createdAt: string;
}

interface CorrelationInsightsProps {
  activities: ActivityData[];
}

interface ActivityCorrelation {
  activity: string;
  averageMood: number;
  frequency: number;
  trend: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
}

const CorrelationInsights: React.FC<CorrelationInsightsProps> = ({ activities }) => {
  const correlations = useMemo(() => {
    if (activities.length === 0) return [];

    // Calculate correlations for each activity
    const activityStats: { [key: string]: { moods: number[], count: number } } = {};
    
    activities.forEach(activity => {
      activity.activities.forEach(act => {
        if (!activityStats[act]) {
          activityStats[act] = { moods: [], count: 0 };
        }
        activityStats[act].moods.push(activity.mood);
        activityStats[act].count += 1;
      });
    });

    // Calculate average mood for each activity
    const correlations: ActivityCorrelation[] = Object.entries(activityStats)
      .map(([activity, stats]) => {
        const averageMood = stats.moods.reduce((sum, mood) => sum + mood, 0) / stats.moods.length;
        const overallAverage = activities.reduce((sum, a) => sum + a.mood, 0) / activities.length;
        
        let trend: 'positive' | 'negative' | 'neutral' = 'neutral';
        if (averageMood > overallAverage + 0.5) trend = 'positive';
        else if (averageMood < overallAverage - 0.5) trend = 'negative';

        let impact: 'high' | 'medium' | 'low' = 'low';
        if (stats.count >= 5) impact = 'high';
        else if (stats.count >= 3) impact = 'medium';

        return {
          activity,
          averageMood: Math.round(averageMood * 10) / 10,
          frequency: stats.count,
          trend,
          impact
        };
      })
      .filter(corr => corr.frequency >= 2) // Only show activities with at least 2 occurrences
      .sort((a, b) => b.averageMood - a.averageMood);

    return correlations;
  }, [activities]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😄';
    if (mood >= 6) return '😊';
    if (mood >= 4) return '😐';
    if (mood >= 2) return '😔';
    return '😞';
  };

  const generatedInsights = useMemo(() => {
    const insights = [];
    
    if (activities.length === 0) {
      return ["Log more activities to see personalized insights!"];
    }

    // Find best and worst activities
    const bestActivity = correlations.find(insight => insight.trend === 'positive' && insight.impact === 'high');
    const worstActivity = correlations.find(insight => insight.trend === 'negative' && insight.impact === 'high');

    if (bestActivity) {
      insights.push(`You feel ${bestActivity.averageMood}/10 on average when you do ${bestActivity.activity}. Keep it up! 🎉`);
    }

    if (worstActivity) {
      insights.push(`Your mood tends to be lower (${worstActivity.averageMood}/10) when you do ${worstActivity.activity}. Consider alternatives. 🤔`);
    }

    // Find most frequent activity
    if (correlations.length > 0) {
      const mostFrequent = correlations.reduce((prev, current) => 
        prev.frequency > current.frequency ? prev : current
      );

      insights.push(`You do ${mostFrequent.activity} most often (${mostFrequent.frequency} times). Your average mood during this activity is ${mostFrequent.averageMood}/10.`);
    }

    // Mood consistency insight
    const moodVariance = activities.reduce((sum, activity) => {
      const avg = activities.reduce((s, a) => s + a.mood, 0) / activities.length;
      return sum + Math.pow(activity.mood - avg, 2);
    }, 0) / activities.length;

    if (moodVariance < 2) {
      insights.push("Your mood has been quite consistent lately. Great emotional stability! 🧘‍♀️");
    } else if (moodVariance > 6) {
      insights.push("Your mood has been quite variable. Consider tracking what influences these changes. 📊");
    }

    return insights.length > 0 ? insights : ["Keep logging your activities to discover more insights!"];
  }, [correlations, activities]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8"
    >
      <div className="flex items-center mb-6">
        <div className="p-3 bg-indigo-100 rounded-lg mr-4">
          <Brain className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Mood & Activity Insights</h3>
          <p className="text-gray-600 text-sm">Discover patterns in your wellness journey</p>
        </div>
      </div>

      {correlations.length === 0 ? (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Not enough data yet</p>
          <p className="text-gray-400 text-sm">Log more activities to see personalized insights</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Correlations */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 text-teal-600 mr-2" />
              Activity Impact on Mood
            </h4>
            <div className="space-y-3">
              {correlations.slice(0, 5).map((insight, index) => (
                <motion.div
                  key={insight.activity}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{insight.activity}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getMoodEmoji(insight.averageMood)}</span>
                      <span className="font-bold text-gray-900">{insight.averageMood}/10</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(insight.trend)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(insight.trend)}`}>
                        {insight.trend}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                        {insight.impact} impact
                      </span>
                      <span className="text-xs text-gray-500">
                        {insight.frequency} times
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 text-yellow-600 mr-2" />
              Personalized Insights
            </h4>
            <div className="space-y-3">
              {generatedInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-start">
                    <Zap className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-800 text-sm leading-relaxed">{insight}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-green-50 rounded-lg border border-teal-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-teal-600">
                {correlations.length}
              </div>
              <div className="text-sm text-teal-700">Activities Tracked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {correlations.filter(i => i.trend === 'positive').length}
              </div>
              <div className="text-sm text-green-700">Positive Impact</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {activities.length}
              </div>
              <div className="text-sm text-blue-700">Total Logs</div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CorrelationInsights;
