// Location service for handling geolocation and Google Places API calls
import api from '../utils/axiosConfig';

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    // Check if we're in a secure context (HTTPS or localhost)
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      reject(new Error('Geolocation requires a secure context (HTTPS) or localhost'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        let suggestion = '';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            suggestion = 'Please allow location access in your browser settings and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            suggestion = 'Please check your internet connection and GPS settings.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            suggestion = 'Please try again or check your internet connection.';
            break;
          default:
            suggestion = 'Please try again or use the manual search option.';
        }
        
        const enhancedError = new Error(errorMessage);
        enhancedError.suggestion = suggestion;
        enhancedError.code = error.code;
        reject(enhancedError);
      },
      {
        enableHighAccuracy: false, // Changed to false for better compatibility
        timeout: 15000, // Increased timeout
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

export const fetchNearbyTherapists = async (lat, lng, radius = 5000) => {
  try {
    const response = await api.get(
      `/therapists/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby therapists:', error);
    throw error;
  }
};

export const fetchPlaceDetails = async (placeId) => {
  try {
    const response = await api.get(`/therapists/nearby/details/${placeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching place details:', error);
    throw error;
  }
};

export const formatDistance = (distanceInMeters) => {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)}m`;
  } else {
    return `${(distanceInMeters / 1000).toFixed(1)}km`;
  }
};

export const getDirectionsUrl = (lat, lng, name) => {
  const encodedName = encodeURIComponent(name);
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodedName}`;
};
