import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Video, 
  Phone,
  MessageCircle,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Therapist {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    profile: {
      avatar?: string;
    };
  };
  specialization: string[];
  sessionSettings: {
    duration: number;
    price: number;
    currency: string;
    acceptsInsurance: boolean;
  };
  availability: {
    timezone: string;
  };
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
}

const BookAppointmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [appointmentType, setAppointmentType] = useState('video');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (id) {
      fetchTherapistProfile();
    }
  }, [id, user, navigate]);

  useEffect(() => {
    if (selectedDate && therapist) {
      fetchAvailableSlots();
    }
  }, [selectedDate, therapist]);

  const fetchTherapistProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/therapist/${id}`);
      const data = await response.json();

      if (data.success) {
        setTherapist(data.data);
      } else {
        console.error('Error fetching therapist profile:', data.message);
        navigate('/therapists');
      }
    } catch (error) {
      console.error('Error fetching therapist profile:', error);
      navigate('/therapists');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 7);

      const response = await fetch(
        `/api/therapist/${id}/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const data = await response.json();

      if (data.success) {
        setAvailableSlots(data.data.availableSlots);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !therapist) return;

    try {
      setBooking(true);
      const response = await fetch('/api/appointment/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          therapistId: therapist._id,
          scheduledAt: selectedSlot.startTime,
          duration: therapist.sessionSettings.duration,
          type: 'consultation',
          sessionType: appointmentType,
          notes
        })
      });

      const data = await response.json();

      if (data.success) {
        navigate('/appointments', { 
          state: { 
            message: 'Appointment booked successfully!',
            appointment: data.data
          }
        });
      } else {
        alert(data.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(`/therapist/${id}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Profile</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Book Appointment</h1>

              {/* Therapist Info */}
              <div className="flex items-center space-x-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <img
                  src={therapist.userId.profile?.avatar || '/default-avatar.png'}
                  alt={`${therapist.userId.firstName} ${therapist.userId.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {therapist.userId.firstName} {therapist.userId.lastName}
                  </h2>
                  <p className="text-gray-600">{therapist.specialization.join(', ')}</p>
                  <p className="text-sm text-gray-500">{therapist.availability.timezone}</p>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Times for {formatDate(selectedDate)}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 text-sm border rounded-lg transition-colors ${
                            selectedSlot?.startTime === slot.startTime
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                          }`}
                        >
                          {formatTime(slot.startTime)}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No available slots for this date</p>
                        <p className="text-sm">Please select a different date</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Session Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'video', label: 'Video Call', icon: Video, description: 'Face-to-face video session' },
                    { id: 'audio', label: 'Phone Call', icon: Phone, description: 'Audio-only session' },
                    { id: 'chat', label: 'Text Chat', icon: MessageCircle, description: 'Text-based session' }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setAppointmentType(type.id)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        appointmentType === type.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <type.icon className="h-6 w-6 mb-2 text-primary-600" />
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific concerns or topics you'd like to discuss..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookAppointment}
                disabled={!selectedSlot || booking}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                {booking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-5 w-5" />
                    <span>Book Appointment</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Summary</h3>
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
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium capitalize">{appointmentType} call</span>
                </div>
                {selectedSlot && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Time</span>
                    <span className="font-medium">{formatTime(selectedSlot.startTime)}</span>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">{formatDate(selectedDate)}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Payment Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Payment required at booking</span>
                </div>
                {therapist.sessionSettings.acceptsInsurance && (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-600">Insurance accepted</span>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  You can cancel or reschedule up to 24 hours before your appointment.
                </div>
              </div>
            </motion.div>

            {/* Important Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-blue-50 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Important
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Please arrive 5 minutes early for your session</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Ensure you have a stable internet connection</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Find a quiet, private space for your session</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>You'll receive a meeting link via email</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentPage;
