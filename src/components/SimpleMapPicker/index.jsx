import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const SimpleMapPicker = ({ onLocationSelect, initialCenter }) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAddress, setCurrentAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps not loaded');
      return;
    }

    initializeMap();
  }, []);

  const initializeMap = async () => {
    const defaultCenter = initialCenter || { lat: 13.7563, lng: 100.5018 }; // Bangkok

    // Create map
    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'greedy',
    });

    mapInstanceRef.current = map;

    // Add drag end listener
    map.addListener('dragend', () => {
      const center = map.getCenter();
      reverseGeocode(center.lat(), center.lng());
    });

    // Add zoom change listener
    map.addListener('zoom_changed', () => {
      const center = map.getCenter();
      reverseGeocode(center.lat(), center.lng());
    });

    setIsLoading(false);

    // Auto-locate user
    getCurrentLocation();
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(location);
          mapInstanceRef.current.setZoom(16);
        }

        reverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setIsLocating(false);
        // Use default location (Bangkok)
        const defaultLat = 13.7563;
        const defaultLng = 100.5018;
        reverseGeocode(defaultLat, defaultLng);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat, lng };

      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const place = results[0];
          setCurrentAddress(place.formatted_address);

          // Parse address components
          const components = place.address_components || [];
          const getComponent = (type) => {
            const component = components.find(c => c.types.includes(type));
            return component?.long_name || '';
          };

          const addressData = {
            formatted_address: place.formatted_address,
            detail: place.formatted_address,
            province: getComponent('administrative_area_level_1'),
            city: getComponent('administrative_area_level_2'), // Amphoe
            sub_district: getComponent('sublocality_level_1') || getComponent('sublocality'), // Tambon
            postal_code: getComponent('postal_code'),
            coordinates: { lat, lng }
          };

          if (onLocationSelect) {
            onLocationSelect(addressData);
          }
        }
      });
    } catch (error) {
      console.error('Reverse geocode error:', error);
    }
  };

  const handleRecenter = () => {
    getCurrentLocation();
  };

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border-2 border-gray-200">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Center Marker (Fixed Pin) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10">
        <svg 
          className="w-12 h-12 text-red-500 drop-shadow-lg animate-bounce" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">{t('map.loading', 'Loading map...')}</p>
          </div>
        </div>
      )}

      {/* Locating Overlay */}
      {isLocating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg z-20 flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
          <span className="text-sm font-medium">{t('map.locating', 'Locating...')}</span>
        </div>
      )}

      {/* Address Display */}
      {currentAddress && !isLoading && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg z-20">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-gray-700 flex-1 leading-relaxed">{currentAddress}</p>
          </div>
        </div>
      )}

      {/* Recenter Button */}
      <button
        onClick={handleRecenter}
        className="absolute top-4 right-4 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg z-20 transition-all cursor-pointer active:scale-95"
        title={t('map.recenter', 'My Location')}
      >
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md z-20">
        <p className="text-xs text-gray-600 font-medium">
          📍 {t('map.instruction', 'Drag map to select location')}
        </p>
      </div>
    </div>
  );
};

export default SimpleMapPicker;
