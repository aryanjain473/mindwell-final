import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Clock, Moon, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

interface StressCheckForm {
  workload: number;
  deadlines: number;
  concentration: number;
  sleep: number;
  emotionTags: string[];
}

const emotionOptions = ['Anxious', 'Overwhelmed', 'Confused', 'Bored', 'Frustrated'];

const AcademicStressCheck = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StressCheckForm>({
    workload: 5,
    deadlines: 5,
    concentration: 5,
    sleep: 5,
    emotionTags: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSliderChange = (field: keyof StressCheckForm, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleEmotion = (emotion: string) => {
    setFormData(prev => ({
      ...prev,
      emotionTags: prev.emotionTags.includes(emotion)
        ? prev.emotionTags.filter(e => e !== emotion)
        : [...prev.emotionTags, emotion]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Ensure all numeric values are numbers, not strings
      const submitData = {
        workload: Number(formData.workload),
        deadlines: Number(formData.deadlines),
        concentration: Number(formData.concentration),
        sleep: Number(formData.sleep),
        emotionTags: Array.isArray(formData.emotionTags) ? formData.emotionTags : []
      };
      
      console.log('Submitting stress check with data:', submitData);
      const response = await api.post('/stress/submit', submitData);
      console.log('Response received:', response.data);
      if (response.data.success) {
        setResult(response.data.data);
      } else {
        const errorMsg = response.data.errors 
          ? response.data.errors.map((e: any) => e.msg || e.message).join(', ')
          : response.data.message || 'Failed to submit stress check. Please try again.';
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('Error submitting stress check:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = 'Failed to submit stress check. Please try again.';
      
      if (err.response?.data) {
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          errorMessage = err.response.data.errors.map((e: any) => e.msg || e.message).join(', ');
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSliderLabel = (value: number, type: string) => {
    if (type === 'concentration' || type === 'sleep') {
      // Inverted labels for these
      if (value <= 3) return 'Very Low';
      if (value <= 5) return 'Low';
      if (value <= 7) return 'Moderate';
      if (value <= 9) return 'Good';
      return 'Excellent';
    } else {
      // Normal labels for workload and deadlines
      if (value <= 3) return 'Low';
      if (value <= 5) return 'Moderate';
      if (value <= 7) return 'High';
      if (value <= 9) return 'Very High';
      return 'Extreme';
    }
  };

  const getStressLevelColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getStressLevelLabel = (score: number) => {
    if (score >= 70) return 'High Stress';
    if (score >= 40) return 'Moderate Stress';
    return 'Low Stress';
  };

  if (result) {
    return (
      <div className="space-y-6">
        {/* Stress Score Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-xl p-6 ${getStressLevelColor(result.stressScore)}`}
        >
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{result.stressScore}/100</div>
            <div className="text-lg font-semibold">{getStressLevelLabel(result.stressScore)}</div>
          </div>
        </motion.div>

        {/* Insights */}
        {result.insights && result.insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary-600" />
              <span>Your Stress Insights Today</span>
            </h3>
            <div className="space-y-3">
              {result.insights.map((insight: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    insight.type === 'warning' ? 'bg-red-50 border border-red-200' :
                    insight.type === 'success' ? 'bg-green-50 border border-green-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{insight.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{insight.message}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommended Routine */}
        {result.recommendedRoutine && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary-600" />
              <span>Your Personalized Routine</span>
            </h3>
            <p className="text-gray-600 mb-4">{result.recommendedRoutine.rationale}</p>

            <div className="space-y-3">
              {result.recommendedRoutine.steps.map((step: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{step.icon}</span>
                        <h4 className="font-semibold text-gray-900">{step.title}</h4>
                        {step.duration > 0 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {step.duration} min
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                      {step.game && (
                        <button
                          onClick={() => navigate(`/wellness-games/${step.game}`)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Start {step.title} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total Routine Duration</span>
                <span className="font-semibold text-gray-900">
                  {result.recommendedRoutine.duration} minutes
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setResult(null);
              setFormData({
                workload: 5,
                deadlines: 5,
                concentration: 5,
                sleep: 5,
                emotionTags: []
              });
            }}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Take Another Check
          </button>
          <button
            onClick={() => navigate('/stress/academic')}
            className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            View History
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Workload Pressure */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          <label className="text-lg font-semibold text-gray-900">Workload Pressure</label>
        </div>
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Low</span>
            <span className="font-semibold text-primary-600">
              {getSliderLabel(formData.workload, 'workload')}
            </span>
            <span>Extreme</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.workload}
            onChange={(e) => handleSliderChange('workload', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Deadlines Pressure */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="h-5 w-5 text-primary-600" />
          <label className="text-lg font-semibold text-gray-900">Deadlines Pressure</label>
        </div>
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Low</span>
            <span className="font-semibold text-primary-600">
              {getSliderLabel(formData.deadlines, 'deadlines')}
            </span>
            <span>Extreme</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.deadlines}
            onChange={(e) => handleSliderChange('deadlines', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Concentration Level */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="h-5 w-5 text-primary-600" />
          <label className="text-lg font-semibold text-gray-900">Concentration Level</label>
        </div>
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Very Low</span>
            <span className="font-semibold text-primary-600">
              {getSliderLabel(formData.concentration, 'concentration')}
            </span>
            <span>Excellent</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.concentration}
            onChange={(e) => handleSliderChange('concentration', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Sleep/Rest Score */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Moon className="h-5 w-5 text-primary-600" />
          <label className="text-lg font-semibold text-gray-900">Sleep/Rest Score</label>
        </div>
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Very Poor</span>
            <span className="font-semibold text-primary-600">
              {getSliderLabel(formData.sleep, 'sleep')}
            </span>
            <span>Excellent</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.sleep}
            onChange={(e) => handleSliderChange('sleep', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Emotion Tags */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="text-lg font-semibold text-gray-900 mb-4 block flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-primary-600" />
          <span>How are you feeling? (Select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {emotionOptions.map((emotion) => (
            <button
              key={emotion}
              type="button"
              onClick={() => toggleEmotion(emotion)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                formData.emotionTags.includes(emotion)
                  ? 'bg-primary-100 border-primary-400 text-primary-700 font-medium'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-primary-300'
              }`}
            >
              {emotion}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
      >
        {isSubmitting ? 'Analyzing...' : 'Complete Stress Check'}
      </button>
    </form>
  );
};

export default AcademicStressCheck;

