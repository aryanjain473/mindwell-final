import React, { useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

interface MapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  className?: string;
}

const MapComponent: React.FC<MapProps> = ({ center, zoom, className }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      new window.google.maps.Map(ref.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'cooperative'
      });
    }
  }, [center, zoom]);

  return <div ref={ref} className={className} />;
};

const Map: React.FC<MapProps> = (props) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Visit Our Office</h3>
              <p className="text-gray-600 mb-4">
                KJ Somaiya School of Engineering<br />
                Vidyavihar East<br />
                Mumbai, India
              </p>
              {!apiKey ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Google Maps API Key Missing:</strong> Please configure VITE_GOOGLE_MAPS_API_KEY in your environment variables to enable interactive maps.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Map could not be loaded. Please check your internet connection.
                </p>
              )}
            </div>
          </div>
        );
      default:
        return <MapComponent {...props} />;
    }
  };

  // If no API key, show fallback immediately
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Visit Our Office</h3>
          <p className="text-gray-600 mb-4">
            KJ Somaiya School of Engineering<br />
            Vidyavihar East<br />
            Mumbai, India
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Google Maps API Key Missing:</strong> Please configure VITE_GOOGLE_MAPS_API_KEY in your environment variables to enable interactive maps.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Wrapper
      apiKey={apiKey}
      render={render}
    />
  );
};

export default Map;
