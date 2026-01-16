import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { reverseGeocodeThai } from '../../utils/addressParser';

/**
 * Interactive Map Picker Component
 * 
 * 交互式地图选择器 - 支持点击地图获取地址
 */
const InteractiveMapPicker = ({ 
  initialLat = 13.7563, 
  initialLng = 100.5018,
  onLocationSelect,
  className = ""
}) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    lat: initialLat,
    lng: initialLng
  });

  // 初始化地图
  useEffect(() => {
    if (!window.google || !window.google.maps) {
      console.warn("Google Maps not loaded yet");
      return;
    }

    if (!mapRef.current || mapInstanceRef.current) return;

    // 创建地图实例
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: initialLat, lng: initialLng },
      zoom: 15,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: 'greedy'
    });

    // 创建标记
    const marker = new window.google.maps.Marker({
      position: { lat: initialLat, lng: initialLng },
      map: map,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
      title: t("address.map.marker_title", "Selected Location")
    });

    // 地图点击事件
    map.addListener('click', async (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      marker.setPosition(e.latLng);
      setCurrentLocation({ lat, lng });
      
      // 反向地理编码
      await handleReverseGeocode(lat, lng);
    });

    // 标记拖拽事件
    marker.addListener('dragend', async (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      setCurrentLocation({ lat, lng });
      map.panTo(e.latLng);
      
      // 反向地理编码
      await handleReverseGeocode(lat, lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      if (mapInstanceRef.current) {
        window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
      }
      if (markerRef.current) {
        window.google.maps.event.clearInstanceListeners(markerRef.current);
      }
    };
  }, []);

  // 反向地理编码
  const handleReverseGeocode = async (lat, lng) => {
    setIsLoading(true);
    try {
      const addressData = await reverseGeocodeThai(lat, lng);
      if (onLocationSelect) {
        onLocationSelect({
          ...addressData,
          coordinates: { lat, lng }
        });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取当前位置
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t("address.map.geolocation_not_supported", "Geolocation is not supported"));
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setCurrentLocation({ lat, lng });
        
        if (mapInstanceRef.current && markerRef.current) {
          const newPos = { lat, lng };
          mapInstanceRef.current.panTo(newPos);
          mapInstanceRef.current.setZoom(16);
          markerRef.current.setPosition(newPos);
          
          // 反向地理编码
          await handleReverseGeocode(lat, lng);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert(t("address.map.geolocation_error", "Unable to get your location"));
        setIsLoading(false);
      }
    );
  };

  // 更新地图位置（外部调用）
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const newPos = { lat: initialLat, lng: initialLng };
      mapInstanceRef.current.panTo(newPos);
      markerRef.current.setPosition(newPos);
      setCurrentLocation({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng]);

  return (
    <div className={`relative ${className}`}>
      {/* 地图容器 */}
      <div 
        ref={mapRef} 
        className="w-full h-80 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200"
      />

      {/* 控制按钮 */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* 当前位置按钮 */}
        <button
          onClick={handleGetCurrentLocation}
          disabled={isLoading}
          className="bg-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
          title={t("address.map.get_current_location", "Get Current Location")}
        >
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          ) : (
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* 坐标显示 */}
      <div className="mt-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold text-blue-900">
              {t("address.map.selected_location", "Selected Location")}:
            </span>
          </div>
          <span className="font-mono text-blue-700 text-xs">
            {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
          </span>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="mt-3 bg-yellow-50 rounded-xl p-3 border border-yellow-100">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs text-yellow-800 leading-relaxed">
            <p className="font-semibold mb-1">{t("address.map.instructions_title", "How to use")}:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>{t("address.map.instruction_1", "Click on the map to select a location")}</li>
              <li>{t("address.map.instruction_2", "Drag the marker to adjust position")}</li>
              <li>{t("address.map.instruction_3", "Click the location button to use your current position")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMapPicker;
