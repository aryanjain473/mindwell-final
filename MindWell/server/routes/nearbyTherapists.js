import express from 'express';
import { body, query, validationResult } from 'express-validator';
import axios from 'axios';

const router = express.Router();

// @route   GET /api/therapists/nearby
// @desc    Get nearby therapists using Google Places API
// @access  Public
router.get('/nearby', [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  query('radius').optional().isInt({ min: 1, max: 50000 }).withMessage('Radius must be between 1 and 50000 meters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }

    const { lat, lng, radius = 5000 } = req.query;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    console.log('🔑 API Key loaded:', apiKey ? 'Yes' : 'No');
    console.log('🔑 API Key value:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
    console.log('📍 Search location:', { lat, lng, radius });

    if (!apiKey) {
      return res.status(200).json({
        success: true,
        message: 'Google Places API not configured - using fallback data',
        data: {
          therapists: [],
          totalFound: 0,
          searchLocation: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseInt(radius) },
          apiStatus: 'unavailable',
          fallbackMessage: 'Please configure GOOGLE_PLACES_API_KEY to enable nearby therapist search, or use platform therapists instead'
        }
      });
    }

    // Search for different types of mental health professionals
    const searchQueries = [
      'psychologist',
      'therapist',
      'psychiatrist', 
      'counselor',
      'mental health'
    ];

    const allResults = [];

    // Make parallel requests for different search terms
    const searchPromises = searchQueries.map(async (keyword) => {
      const maxRetries = 2;
      let retryCount = 0;
      
      while (retryCount <= maxRetries) {
        try {
          console.log(`🔍 Searching for: ${keyword} (attempt ${retryCount + 1})`);
          const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
            params: {
              location: `${lat},${lng}`,
              radius: radius,
              type: 'doctor',
              keyword: keyword,
              key: apiKey
            },
            timeout: 30000 // Increase timeout to 30 seconds
          });

          console.log(`📊 Results for ${keyword}:`, response.data.results?.length || 0, 'places found');
          console.log(`📋 API Status:`, response.data.status);
          
          return response.data.results || [];
        } catch (error) {
          retryCount++;
          console.error(`❌ Error searching for ${keyword} (attempt ${retryCount}):`, error.message);
          
          if (error.response) {
            console.error('📋 API Error Response:', error.response.data);
            // Don't retry on API errors (like REQUEST_DENIED)
            return [];
          } else if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            if (retryCount <= maxRetries) {
              console.log(`🔄 Retrying ${keyword} in 2 seconds...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue;
            } else {
              console.error(`❌ Max retries reached for ${keyword}`);
              return [];
            }
          } else {
            return [];
          }
        }
      }
      return [];
    });

    const searchResults = await Promise.all(searchPromises);
    
    // Flatten and deduplicate results
    const seenPlaceIds = new Set();
    searchResults.flat().forEach(place => {
      if (!seenPlaceIds.has(place.place_id)) {
        seenPlaceIds.add(place.place_id);
        allResults.push(place);
      }
    });

    // Transform results to our unified format
    const therapists = allResults.map(place => {
      // Extract specialization from types or name
      let specialization = 'Mental Health Professional';
      if (place.types.includes('psychologist')) {
        specialization = 'Psychologist';
      } else if (place.types.includes('psychiatrist')) {
        specialization = 'Psychiatrist';
      } else if (place.name.toLowerCase().includes('therapist')) {
        specialization = 'Therapist';
      } else if (place.name.toLowerCase().includes('counselor')) {
        specialization = 'Counselor';
      }

      // Calculate distance (approximate)
      const distance = calculateDistance(
        parseFloat(lat), 
        parseFloat(lng), 
        place.geometry.location.lat, 
        place.geometry.location.lng
      );

      return {
        id: place.place_id,
        name: place.name,
        specialization: [specialization],
        address: place.vicinity,
        rating: place.rating || 0,
        ratingCount: place.user_ratings_total || 0,
        distance: Math.round(distance),
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        isGooglePlace: true,
        googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        phone: place.formatted_phone_number || null,
        website: place.website || null,
        openingHours: place.opening_hours ? {
          openNow: place.opening_hours.open_now,
          weekdayText: place.opening_hours.weekday_text || []
        } : null,
        priceLevel: place.price_level || null
      };
    });

    // Sort by distance
    therapists.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      data: {
        therapists,
        location: {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        },
        radius: parseInt(radius),
        totalFound: therapists.length
      }
    });

  } catch (error) {
    console.error('Error fetching nearby therapists:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby therapists',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/therapists/nearby/details/:placeId
// @desc    Get detailed information about a specific Google Place
// @access  Public
router.get('/nearby/details/:placeId', [
  query('placeId').isString().withMessage('Valid place ID is required')
], async (req, res) => {
  try {
    const { placeId } = req.params;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        success: true,
        message: 'Google Places API not configured - details unavailable',
        data: {
          placeId: placeId,
          apiStatus: 'unavailable',
          fallbackMessage: 'Please configure GOOGLE_PLACES_API_KEY to enable detailed therapist information'
        }
      });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        fields: 'name,formatted_address,formatted_phone_number,website,opening_hours,rating,user_ratings_total,reviews,photos,types',
        key: apiKey
      }
    });

    if (response.data.status !== 'OK') {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    const place = response.data.result;
    
    // Transform to our format
    const therapist = {
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      website: place.website,
      rating: place.rating || 0,
      ratingCount: place.user_ratings_total || 0,
      reviews: place.reviews ? place.reviews.map(review => ({
        author: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.time
      })) : [],
      photos: place.photos ? place.photos.map(photo => ({
        photoReference: photo.photo_reference,
        height: photo.height,
        width: photo.width
      })) : [],
      openingHours: place.opening_hours ? {
        openNow: place.opening_hours.open_now,
        weekdayText: place.opening_hours.weekday_text || []
      } : null,
      types: place.types || [],
      isGooglePlace: true,
      googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
    };

    res.json({
      success: true,
      data: therapist
    });

  } catch (error) {
    console.error('Error fetching place details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching place details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance * 1000; // Convert to meters
}

export default router;
