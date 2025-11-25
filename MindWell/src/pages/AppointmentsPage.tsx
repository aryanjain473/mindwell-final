import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  MessageCircle,
  User,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Appointment {
  _id: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  type: 'consultation' | 'follow-up' | 'emergency' | 'assessment';
  sessionType: 'video' | 'audio' | 'chat' | 'in-person';
  therapist: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
      profile: {
        avatar?: string;
      };
    };
    specialization: string[];
    ratings: {
      average: number;
      count: number;
    };
  };
  pricing: {
    finalPrice: number;
    currency: string;
    paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  };
  notes: {
    userNotes?: string;
  };
  meetingDetails?: {
    roomId: string;
    meetingUrl: string;
    platform: string;
  };
}

const AppointmentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/appointment/my-appointments?status=${filter === 'all' ? '' : filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setAppointments(data.data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = (appointment: Appointment) => {
    if (appointment.status === 'scheduled' || appointment.status === 'confirmed') {
      // In a real app, this would start the session and redirect to video consultation
      navigate(`/video-consultation/session-${appointment._id}`);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const response = await fetch(`/api/appointment/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          reason: 'User requested cancellation'
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchAppointments(); // Refresh the list
        alert('Appointment cancelled successfully');
      } else {
        alert(data.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Video className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'no-show':
        return <AlertCircle className="h-4 w-4" />;
      case 'rescheduled':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        appointment.therapist.userId.firstName.toLowerCase().includes(searchLower) ||
        appointment.therapist.userId.lastName.toLowerCase().includes(searchLower) ||
        appointment.therapist.specialization.some(spec => 
          spec.toLowerCase().includes(searchLower)
        )
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
              <p className="text-gray-600">Manage your therapy sessions and appointments</p>
            </div>
            <button
              onClick={() => navigate('/therapists')}
              className="mt-4 sm:mt-0 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Book New Appointment</span>
            </button>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ].map(status => (
                <button
                  key={status.value}
                  onClick={() => setFilter(status.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Appointments List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((appointment, index) => {
              const { date, time } = formatDateTime(appointment.scheduledAt);
              const isUpcoming = new Date(appointment.scheduledAt) > new Date() && 
                ['scheduled', 'confirmed'].includes(appointment.status);
              
              return (
                <motion.div
                  key={appointment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      {/* Therapist Info */}
                      <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                        <img
                          src={appointment.therapist.userId.profile?.avatar || '/default-avatar.png'}
                          alt={`${appointment.therapist.userId.firstName} ${appointment.therapist.userId.lastName}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {appointment.therapist.userId.firstName} {appointment.therapist.userId.lastName}
                          </h3>
                          <p className="text-gray-600 mb-1">
                            {appointment.therapist.specialization.join(', ')}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{date}</span>
                            <span>{time}</span>
                            <span>{appointment.duration} minutes</span>
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                        {/* Status */}
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="capitalize">{appointment.status.replace('-', ' ')}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          {isUpcoming && (
                            <button
                              onClick={() => handleJoinSession(appointment)}
                              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center space-x-2"
                            >
                              {appointment.sessionType === 'video' ? (
                                <Video className="h-4 w-4" />
                              ) : appointment.sessionType === 'audio' ? (
                                <Phone className="h-4 w-4" />
                              ) : (
                                <MessageCircle className="h-4 w-4" />
                              )}
                              <span>Join Session</span>
                            </button>
                          )}
                          
                          {appointment.status === 'scheduled' && (
                            <button
                              onClick={() => handleCancelAppointment(appointment._id)}
                              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                            >
                              Cancel
                            </button>
                          )}

                          <button className="p-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600">
                            ${appointment.pricing.finalPrice} {appointment.pricing.currency}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600">
                            {appointment.therapist.ratings.average.toFixed(1)} ⭐ 
                            ({appointment.therapist.ratings.count} reviews)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {appointment.sessionType === 'video' ? (
                            <Video className="h-4 w-4 text-purple-600" />
                          ) : appointment.sessionType === 'audio' ? (
                            <Phone className="h-4 w-4 text-purple-600" />
                          ) : (
                            <MessageCircle className="h-4 w-4 text-purple-600" />
                          )}
                          <span className="text-gray-600 capitalize">
                            {appointment.sessionType} session
                          </span>
                        </div>
                      </div>

                      {appointment.notes.userNotes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Your notes:</strong> {appointment.notes.userNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? "You don't have any appointments yet. Book your first session with a therapist."
                : `No ${filter} appointments found. Try adjusting your filters.`
              }
            </p>
            <button
              onClick={() => navigate('/therapists')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Book Appointment
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
