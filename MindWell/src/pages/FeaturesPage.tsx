import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  MessageCircle, 
  Camera, 
  Video, 
  Gamepad2, 
  Shield, 
  Clock, 
  BarChart3,
  Smile,
  Zap,
  Heart,
  CheckCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';

const FeaturesPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'AI Mental Health Companion',
      description: 'Advanced AI that understands your emotional state and provides personalized guidance 24/7.',
      color: 'from-blue-500 to-purple-600',
      benefits: ['24/7 availability', 'Personalized responses', 'Evidence-based techniques', 'Privacy-first approach'],
      clickable: true,
      action: () => navigate('/chat')
    },
    {
      icon: BookOpen,
      title: 'Academic Stress Management',
      description: 'Track your academic stress levels, get personalized routines, and discover patterns to better manage exam stress and maintain focus.',
      color: 'from-green-500 to-teal-600',
      benefits: ['Stress level tracking', 'Personalized routines', 'Pattern detection', 'Wellness game integration'],
      clickable: true,
      action: () => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
          navigate('/stress/academic');
        } else {
          navigate('/login');
        }
      }
    },
  {
    icon: Video,
    title: 'Find Nearby Therapists',
    description: 'Discover licensed mental health professionals in your area using location-based search.',
    color: 'from-purple-500 to-pink-600',
    benefits: ['Location-based search', 'Real therapist data', 'Ratings & reviews', 'Get directions'],
    clickable: true,
    action: () => navigate('/therapists')
  },
    {
      icon: Gamepad2,
      title: 'Wellness Gamification',
      description: 'Engage with 8 interactive wellness games including breathing exercises, gratitude practice, mood tracking, and meditation.',
      color: 'from-orange-500 to-red-600',
      benefits: ['8 interactive games', 'Breathing exercises', 'Gratitude practice', 'Progress tracking'],
      clickable: true,
      action: () => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
          navigate('/wellness-games');
        } else {
          navigate('/login');
        }
      }
    },
    {
      icon: BarChart3,
      title: 'Mood & Progress Tracking',
      description: 'Comprehensive analytics to understand your mental health patterns and improvements.',
      color: 'from-cyan-500 to-blue-600',
      benefits: ['Detailed analytics', 'Progress visualization', 'Pattern recognition', 'Goal setting'],
      clickable: true,
      action: () => navigate('/dashboard')
    },
    {
      icon: Smile,
      title: 'Facial Emotion Detection',
      description: 'AI-powered facial emotion analysis that detects your emotional state and automatically logs your mood with personalized wellness recommendations.',
      color: 'from-indigo-500 to-purple-600',
      benefits: ['Real-time emotion detection', 'Automatic mood logging', 'AI-powered analysis', 'Personalized recommendations'],
      clickable: true,
      action: () => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
          navigate('/face-mood');
        } else {
          navigate('/login');
        }
      }
    }
  ];

  const additionalFeatures = [
    {
      icon: Shield,
      title: 'End-to-End Encryption',
      description: 'Your data is protected with military-grade security'
    },
    {
      icon: Clock,
      title: 'Crisis Support',
      description: 'Immediate help available during mental health emergencies'
    },
    {
      icon: Zap,
      title: 'Quick Check-ins',
      description: 'Fast mood tracking and wellness assessments'
    },
    {
      icon: Heart,
      title: 'Mindfulness Tools',
      description: 'Guided meditation and breathing exercises'
    }
  ];

  return (
    <div className="min-h-screen py-20">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 mb-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Powerful Features for
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                {' '}Your Wellness
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how our comprehensive suite of mental health tools can transform your wellbeing journey
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Features */}
      <section className="px-4 sm:px-6 lg:px-8 mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                  feature.clickable ? 'cursor-pointer hover:scale-105' : ''
                }`}
                onClick={feature.clickable ? feature.action : undefined}
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                      </div>
                    </div>
                    {feature.clickable && (
                      <div className="flex items-center text-primary-600 group-hover:text-primary-700 transition-colors">
                        <span className="text-sm font-medium mr-2">Try Now</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-primary-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={`h-1 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="px-4 sm:px-6 lg:px-8 mb-20 bg-gradient-to-r from-primary-50 to-secondary-50 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">
              Additional features that make your mental health journey complete
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center group"
              >
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 sm:px-6 lg:px-8 mb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Start your mental wellness journey in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                description: 'Tell us about yourself and your mental health goals to get personalized recommendations.'
              },
              {
                step: '02',
                title: 'Access Your Tools',
                description: 'Use our AI companion, track your mood, and explore our library of wellness activities.'
              },
              {
                step: '03',
                title: 'Track Your Progress',
                description: 'Monitor your mental health journey with detailed analytics and celebrate your achievements.'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center relative"
              >
                <div className="text-6xl font-bold text-primary-200 mb-4">{step.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 -right-6 w-12 h-0.5 bg-primary-300"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands who have already transformed their mental wellness journey
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-primary-600 rounded-full font-semibold text-lg hover:bg-gray-50 transition-colors"
            >
              Start Free Trial
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;