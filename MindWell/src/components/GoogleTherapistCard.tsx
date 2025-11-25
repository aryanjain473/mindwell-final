import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  ExternalLink,
  Navigation,
  DollarSign
} from 'lucide-react';
import { formatDistance, getDirectionsUrl } from '../services/locationService';

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

interface GoogleTherapistCardProps {
  therapist: GoogleTherapist;
  onGetDirections: (therapist: GoogleTherapist) => void;
  onViewDetails: (therapist: GoogleTherapist) => void;
}

const GoogleTherapistCard: React.FC<GoogleTherapistCardProps> = ({
  therapist,
  onGetDirections,
  onViewDetails
}) => {
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

  const getPriceLevelText = (priceLevel?: number) => {
    if (!priceLevel) return null;
    const levels = ['', '$', '$$', '$$$', '$$$$'];
    return levels[priceLevel] || '';
  };

  const isOpenNow = therapist.openingHours?.openNow;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {therapist.name}
              </h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Google Places
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-2">
              {therapist.specialization.join(', ')}
            </p>
            <div className="flex items-center space-x-1 mb-2">
              {renderStars(therapist.rating)}
              <span className="text-sm text-gray-500 ml-1">
                {therapist.rating.toFixed(1)} ({therapist.ratingCount} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Address and Distance */}
        <div className="flex items-start space-x-3 mb-4">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-gray-700 text-sm leading-relaxed">{therapist.address}</p>
            <p className="text-primary-600 text-sm font-medium mt-1">
              {formatDistance(therapist.distance)} away
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {therapist.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <a 
                href={`tel:${therapist.phone}`}
                className="hover:text-primary-600 transition-colors"
              >
                {therapist.phone}
              </a>
            </div>
          )}
          
          {therapist.website && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Globe className="h-4 w-4" />
              <a 
                href={therapist.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 transition-colors truncate"
              >
                Visit Website
              </a>
            </div>
          )}

          {therapist.openingHours && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={`${isOpenNow ? 'text-green-600' : 'text-gray-600'}`}>
                {isOpenNow ? 'Open now' : 'Closed'}
              </span>
            </div>
          )}

          {therapist.priceLevel && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>{getPriceLevelText(therapist.priceLevel)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => onGetDirections(therapist)}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Navigation className="h-4 w-4" />
            <span>Get Directions</span>
          </button>
          
          <button
            onClick={() => onViewDetails(therapist)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Details</span>
          </button>
        </div>

        {/* Google Maps Link */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <a
            href={therapist.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-primary-600 transition-colors flex items-center space-x-1"
          >
            <span>View on Google Maps</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default GoogleTherapistCard;
