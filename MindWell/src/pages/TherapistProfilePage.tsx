import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Clock, 
  DollarSign, 
  MapPin, 
  Users, 
  Award,
  Calendar,
  MessageCircle,
  Video,
  Shield,
  CheckCircle,
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  GraduationCap,
  Heart,
  Brain,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Therapist {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    profile: {
      avatar?: string;
    };
  };
  specialization: string[];
  experience: number;
  languages: string[];
  ratings: {
    average: number;
    count: number;
  };
  sessionSettings: {
    duration: number;
    price: number;
    currency: string;
    acceptsInsurance: boolean;
    insuranceProviders: string[];
  };
  profile: {
    bio?: string;
    approach?: string;
    whatToExpect?: string;
    photo?: string;
    videoIntroduction?: string;
  };
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    year: number;
  }>;
  certifications: Array<{
    name: string;
    issuingBody: string;
    dateIssued: string;
    expiryDate?: string;
  }>;
  availability: {
    timezone: string;
    workingHours: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
  };
  isVerified: boolean;
}

const TherapistProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    if (id) {
      fetchTherapistProfile();
    }
  }, [id]);

  const fetchTherapistProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/therapist/${id}`);
      const data = await response.json();

      if (data.success) {
        setTherapist(data.data);
      } else {
        console.error('Error fetching therapist profile:', data.message);
      }
    } catch (error) {
      console.error('Error fetching therapist profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/book-appointment/${id}`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start space-x-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Therapist not found</h1>
            <button
              onClick={() => navigate('/therapists')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Back to Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/therapists')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Directory</span>
        </motion.button>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={therapist.userId.profile?.avatar || '/default-avatar.png'}
                alt={`${therapist.userId.firstName} ${therapist.userId.lastName}`}
                className="w-32 h-32 rounded-full object-cover"
              />
              {therapist.isVerified && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {therapist.userId.firstName} {therapist.userId.lastName}
                  </h1>
                  <p className="text-lg text-gray-600 mb-2">
                    {therapist.specialization.join(', ')}
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(therapist.ratings.average)}
                      <span className="text-sm text-gray-600 ml-1">
                        {therapist.ratings.average.toFixed(1)} ({therapist.ratings.count} reviews)
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{therapist.experience} years experience</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>${therapist.sessionSettings.price}/{therapist.sessionSettings.duration}min</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>{therapist.languages.length} languages</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Globe className="h-4 w-4 text-purple-600" />
                  <span>{therapist.availability.timezone}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleBookAppointment}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Book Appointment</span>
                </button>
                <button className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium flex items-center justify-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Send Message</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg mb-8"
            >
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'about', label: 'About', icon: Heart },
                    { id: 'approach', label: 'Approach', icon: Brain },
                    { id: 'availability', label: 'Availability', icon: Clock },
                    { id: 'education', label: 'Education', icon: GraduationCap }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About Me</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {therapist.profile.bio || 'Experienced therapist specializing in mental health and wellness with a focus on evidence-based treatments.'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Specializations</h3>
                      <div className="flex flex-wrap gap-2">
                        {therapist.specialization.map(spec => (
                          <span
                            key={spec}
                            className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {therapist.languages.map(lang => (
                          <span
                            key={lang}
                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'approach' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">My Approach</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {therapist.profile.approach || 'I believe in a collaborative approach to therapy, working together with clients to identify goals and develop strategies for positive change.'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">What to Expect</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {therapist.profile.whatToExpect || 'In our sessions, you can expect a safe, non-judgmental space where we work together to explore your thoughts, feelings, and experiences.'}
                      </p>
                    </div>

                    {therapist.certifications.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h3>
                        <div className="space-y-3">
                          {therapist.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <Award className="h-5 w-5 text-primary-600" />
                              <div>
                                <p className="font-medium text-gray-900">{cert.name}</p>
                                <p className="text-sm text-gray-600">{cert.issuingBody}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'availability' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Working Hours</h3>
                      <div className="space-y-3">
                        {therapist.availability.workingHours.map((schedule, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <span className="font-medium text-gray-900">{schedule.day}</span>
                            <span className="text-gray-600">
                              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Timezone</h3>
                      <p className="text-gray-600">{therapist.availability.timezone}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'education' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
                      <div className="space-y-4">
                        {therapist.education.map((edu, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <GraduationCap className="h-5 w-5 text-primary-600 mt-1" />
                            <div>
                              <p className="font-medium text-gray-900">{edu.degree} in {edu.field}</p>
                              <p className="text-gray-600">{edu.institution}</p>
                              <p className="text-sm text-gray-500">{edu.year}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{therapist.sessionSettings.duration} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium text-lg text-green-600">
                    ${therapist.sessionSettings.price}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Currency</span>
                  <span className="font-medium">{therapist.sessionSettings.currency}</span>
                </div>
                {therapist.sessionSettings.acceptsInsurance && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Insurance Accepted</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Insurance Providers */}
            {therapist.sessionSettings.insuranceProviders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Accepted Insurance</h3>
                <div className="space-y-2">
                  {therapist.sessionSettings.insuranceProviders.map((provider, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">{provider}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleBookAppointment}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Book Appointment
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Send Message
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Video Call
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistProfilePage;
