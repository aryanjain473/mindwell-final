import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  DollarSign, 
  MapPin, 
  Award,
  ChevronDown,
  ChevronUp,
  Calendar,
  MessageCircle,
  Video,
  Shield,
  Navigation,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleTherapistCard from '../components/GoogleTherapistCard';
import { 
  getCurrentLocation, 
  fetchNearbyTherapists, 
  formatDistance 
} from '../services/locationService';
import api from '../utils/axiosConfig';


interface GoogleTherapist {
  id: string;
  name: string;
  specialization: string[];
  address: string;
  rating: number;
  ratingCount: number;
  distance: number;
  location: {
    lat: number;
    lng: number;
  };
  isGooglePlace: boolean;
  googleMapsUrl: string;
  phone?: string;
  website?: string;
  openingHours?: {
    openNow: boolean;
    weekdayText: string[];
  };
  priceLevel?: number;
}

const TherapistDirectoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  
  const [googleTherapists, setGoogleTherapists] = useState<GoogleTherapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchMode, setSearchMode] = useState<'nearby'>('nearby');
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    language: '',
    minPrice: '',
    maxPrice: '',
    experience: '',
    rating: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTherapists: 0,
    hasNext: false,
    hasPrev: false
  });

  const specializations = [
    'Anxiety Disorders',
    'Depression',
    'PTSD',
    'Bipolar Disorder',
    'Eating Disorders',
    'Substance Abuse',
    'Couples Therapy',
    'Family Therapy',
    'Child Psychology',
    'Geriatric Psychology',
    'Trauma Therapy',
    'Cognitive Behavioral Therapy',
    'Dialectical Behavior Therapy',
    'Psychodynamic Therapy'
  ];

  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Chinese',
    'Japanese',
    'Korean',
    'Arabic',
    'Hindi'
  ];

  useEffect(() => {
    if (searchMode === 'nearby' && userLocation) {
      fetchNearbyTherapistsData();
    }
  }, [searchMode, userLocation]);

  // Auto-trigger location request when component loads with nearby mode
  useEffect(() => {
    if (searchMode === 'nearby' && !userLocation && !locationLoading) {
      handleUseMyLocation();
    }
  }, [searchMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);


  const fetchNearbyTherapistsData = async () => {
    if (!userLocation) return;
    
    try {
      setLoading(true);
      const data = await fetchNearbyTherapists(userLocation.lat, userLocation.lng, 5000);
      
      if (data.success) {
        setGoogleTherapists(data.data.therapists);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalTherapists: data.data.totalFound,
          hasNext: false,
          hasPrev: false
        });
        
        // If API is unavailable, show a message
        if (data.data.apiStatus === 'unavailable') {
          setLocationError(data.data.fallbackMessage);
        }
      }
    } catch (error) {
      console.error('Error fetching nearby therapists:', error);
      
      // Handle API key missing error
      if (error.response?.data?.message?.includes('API key not configured') || 
          error.response?.data?.message?.includes('Google Places API not configured')) {
        setLocationError(
          'Google Places API is not configured. Please configure the API key to use nearby search.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUseMyLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);
      
      const location = await getCurrentLocation();
      setUserLocation({ lat: location.lat, lng: location.lng });
      setSearchMode('nearby');
    } catch (error) {
      console.error('Error getting location:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      const suggestion = error.suggestion || 'Please try again or use the platform search instead.';
      setLocationError(`${errorMessage}. ${suggestion}`);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleGetDirections = (therapist: GoogleTherapist) => {
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${therapist.location.lat},${therapist.location.lng}`;
    window.open(directionsUrl, '_blank');
  };

  const handleViewDetails = (therapist: GoogleTherapist) => {
    window.open(therapist.googleMapsUrl, '_blank');
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      specialization: '',
      language: '',
      minPrice: '',
      maxPrice: '',
      experience: '',
      rating: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };


  const handleBookAppointment = (therapistId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/book-appointment/${therapistId}`);
  };

  const handleViewProfile = (therapistId: string) => {
    navigate(`/therapist/${therapistId}`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {' '}Therapist
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Connect with licensed mental health professionals who understand your needs
          </p>
          
          {/* Search Mode - Only Nearby */}
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-100 rounded-lg p-3 flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-indigo-600" />
              <span className="text-indigo-800 font-semibold">Nearby Therapists</span>
            </div>
          </div>

          {/* Location Status */}
          {searchMode === 'nearby' && (
            <div className="mb-6">
              {locationLoading ? (
                <div className="flex items-center justify-center space-x-2 text-primary-600">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Getting your location...</span>
                </div>
              ) : locationError ? (
                <div className="flex flex-col items-center space-y-2 text-red-600">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-center">{locationError}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUseMyLocation}
                      className="text-sm underline hover:no-underline"
                    >
                      Try Again
                    </button>
                    <span className="text-gray-400">|</span>
                    <button
                      onClick={switchToPlatformSearch}
                      className="text-sm underline hover:no-underline"
                    >
                      Use Platform Search
                    </button>
                  </div>
                </div>
              ) : userLocation ? (
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <MapPin className="h-4 w-4" />
                  <span>Searching within 5km of your location</span>
                </div>
              ) : (
                <button
                  onClick={handleUseMyLocation}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Use My Location</span>
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, specialization, or keywords..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <select
                  value={filters.specialization}
                  onChange={(e) => handleFilterChange('specialization', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={filters.language}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Languages</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience
                </label>
                <select
                  value={filters.experience}
                  onChange={(e) => handleFilterChange('experience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Any Experience</option>
                  <option value="1">1+ years</option>
                  <option value="3">3+ years</option>
                  <option value="5">5+ years</option>
                  <option value="10">10+ years</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Clear Filters */}
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              Clear all filters
            </button>
            <div className="text-sm text-gray-500">
              {googleTherapists.length} therapists found
            </div>
          </div>
        </motion.div>

        {/* Therapists Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : searchMode === 'platform' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {therapists.map((therapist, index) => (
              <motion.div
                key={therapist._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Therapist Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative">
                      <img
                        src={therapist.userId.profile?.avatar || '/default-avatar.png'}
                        alt={`${therapist.userId.firstName} ${therapist.userId.lastName}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {therapist.isVerified && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Shield className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {therapist.userId.firstName} {therapist.userId.lastName}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {therapist.specialization.slice(0, 2).join(', ')}
                        {therapist.specialization.length > 2 && '...'}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        {renderStars(therapist.ratings.average)}
                        <span className="text-sm text-gray-500 ml-1">
                          ({therapist.ratings.count})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {therapist.profile.bio || 'Experienced therapist specializing in mental health and wellness.'}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{therapist.experience} years exp</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{therapist.languages.length} languages</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-lg font-semibold text-gray-900">
                        ${therapist.sessionSettings.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        /{therapist.sessionSettings.duration}min
                      </span>
                    </div>
                    {therapist.sessionSettings.acceptsInsurance && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Insurance Accepted
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewProfile(therapist._id)}
                      className="flex-1 px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleBookAppointment(therapist._id)}
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {googleTherapists.map((therapist, index) => (
              <GoogleTherapistCard
                key={therapist.id}
                therapist={therapist}
                onGetDirections={handleGetDirections}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center space-x-2 mt-8"
          >
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                className={`px-4 py-2 rounded-lg font-medium ${
                  page === pagination.currentPage
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={!pagination.hasNext}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && (
          (searchMode === 'platform' && therapists.length === 0) ||
          (searchMode === 'nearby' && googleTherapists.length === 0)
        ) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {searchMode === 'nearby' ? (
                <MapPin className="h-12 w-12 text-gray-400" />
              ) : (
                <Users className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No nearby therapists found
            </h3>
            <p className="text-gray-600 mb-4">
              No mental health professionals found within 5km of your location. Try expanding your search area or check back later.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleUseMyLocation}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Use My Location
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TherapistDirectoryPage;
