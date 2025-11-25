import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Heart, Smile, Star, CheckCircle, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import VideoModal from '../components/VideoModal';

const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  const features = [
    {
      icon: Heart,
      title: 'AI-Powered Support',
      description: 'Get personalized mental health guidance with our advanced AI companion'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your mental health data is protected with end-to-end encryption'
    },
    {
      icon: Smile,
      title: 'Facial Emotion Detection',
      description: 'AI-powered emotion analysis that detects your mood and provides personalized wellness recommendations'
    }
  ];

  const testimonials = [
    {
      name: 'Early User',
      role: 'Beta Tester',
      content: 'The AI chat feature is really helpful for quick mental health support. Looking forward to more features!',
      rating: 4
    },
    {
      name: 'Student',
      role: 'University Student',
      content: 'The location-based therapist search is great - found several options near my campus.',
      rating: 4
    },
    {
      name: 'Developer',
      role: 'Tech Enthusiast',
      content: 'Clean interface and promising features. Excited to see how this platform develops.',
      rating: 4
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-texture">
        {/* Soft abstract background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-warm mb-6 leading-tight tracking-tight">
                {isAuthenticated ? (
                  <>
                    Welcome back, {user?.firstName}!{' '}
                    <span className="text-primary-600" style={{background: 'linear-gradient(135deg, #0d9488 0%, #9333ea 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                      Let's continue your journey
                    </span>
                  </>
                ) : (
                  <>
                    Your Mental Wellness
                    <span className="text-primary-600" style={{background: 'linear-gradient(135deg, #0d9488 0%, #9333ea 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                      {' '}Companion
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xl text-warm-light mb-8 max-w-3xl mx-auto leading-relaxed font-normal">
                {isAuthenticated ? (
                  `Welcome to MindWell, ${user?.firstName}! Explore our AI-powered mental health features and discover therapists near you.`
                ) : (
                  'A new platform combining AI-powered mental health support with location-based therapist discovery. Currently in development with core features available.'
                )}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {isAuthenticated ? (
                <>
                  <Link
                    to="/features"
                    className="group btn-warm px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-semibold text-lg flex items-center space-x-2"
                    style={{borderRadius: '1.25rem 1rem 1.5rem 1rem'}}
                  >
                    <span>Explore Features</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <button className="flex items-center space-x-2 px-6 py-4 text-warm-light hover:text-primary-600 transition-colors duration-300 rounded-xl font-medium">
                    <Play className="h-5 w-5" />
                    <span>Start Session</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="group btn-warm px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-semibold text-lg flex items-center space-x-2"
                    style={{borderRadius: '1.25rem 1rem 1.5rem 1rem'}}
                  >
                    <span>Start Your Journey</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <button 
                    onClick={() => setIsVideoModalOpen(true)}
                    className="flex items-center space-x-2 px-6 py-4 text-warm-light hover:text-primary-600 transition-colors duration-300 rounded-xl font-medium"
                  >
                    <Play className="h-5 w-5" />
                    <span>Watch Demo</span>
                  </button>
                </>
              )}
            </motion.div>

            {/* Hero Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-16 relative"
            >
              <div className="w-full max-w-4xl mx-auto bg-gradient-soft rounded-organic-lg p-8 shadow-soft-xl border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {features.map((feature, index) => {
                    const shadowVariations = ['shadow-soft', 'shadow-soft-lg', 'shadow-soft'];
                    const borderRadiusVariations = [
                      'rounded-2xl rounded-tl-[1.5rem]',
                      'rounded-2xl rounded-tr-[1.5rem]',
                      'rounded-2xl rounded-bl-[1.5rem]'
                    ];
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                        className={`text-center p-6 card-soft card-accent-top ${shadowVariations[index]} ${borderRadiusVariations[index]}`}
                      >
                        <div className="mx-auto w-14 h-14 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center mb-4 shadow-soft" style={{borderRadius: '1rem 0.75rem 1.25rem 0.75rem'}}>
                          <feature.icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-lg font-semibold text-warm mb-2">{feature.title}</h3>
                        <p className="text-warm-light text-sm leading-relaxed">{feature.description}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: 'New', label: 'Platform Launch' },
              { number: 'AI-Powered', label: 'Mental Health Support' },
              { number: '24/7', label: 'AI Chat Available' },
              { number: 'Location-Based', label: 'Therapist Discovery' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-4 rounded-xl hover:bg-gray-50 transition-colors duration-300"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2 tracking-tight">{stat.number}</div>
                <div className="text-warm-light text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-soft border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-warm mb-4 tracking-tight">
              What Our Users Say
            </h2>
            <p className="text-xl text-warm-light max-w-3xl mx-auto font-normal">
              Hear from people who have transformed their mental wellness journey with MindWell
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => {
              const borderRadiusVariations = [
                'rounded-2xl rounded-tl-[1.75rem]',
                'rounded-2xl',
                'rounded-2xl rounded-br-[1.75rem]'
              ];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`card-soft card-accent-top p-8 ${borderRadiusVariations[index]}`}
                >
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" strokeWidth={1.5} />
                    ))}
                  </div>
                  <p className="text-warm-light mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                  <div className="pt-4 border-t border-gray-100">
                    <div className="font-semibold text-warm">{testimonial.name}</div>
                    <div className="text-warm-light text-sm mt-1">{testimonial.role}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #0d9488 0%, #9333ea 100%)'}}>
        <div className="absolute inset-0 opacity-10 bg-texture"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
              Ready to Begin Your Wellness Journey?
            </h2>
            <p className="text-xl text-white/95 mb-8 font-normal leading-relaxed">
              Join thousands of people who have found peace, clarity, and support through MindWell.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="btn-warm px-8 py-4 bg-white text-primary-600 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
                style={{borderRadius: '1.25rem 1rem 1.5rem 1rem'}}
              >
                Get Started Free
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 border-2 border-white/80 text-white rounded-2xl font-semibold text-lg hover:bg-white/10 hover:border-white transition-all duration-300 flex items-center justify-center"
                style={{borderRadius: '1.25rem 1rem 1.5rem 1rem'}}
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl="/videos/1764052426095246.mp4"
        title="MindWell Platform Demo"
      />
    </div>
  );
};

export default LandingPage;