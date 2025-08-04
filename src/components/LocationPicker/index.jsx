import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { reverseGeocode } from '../../utils/addressParser';
import './index.scss';

const LocationPicker = ({ 
  onLocationSelect, 
  initialLocation = { lat: 10.762622, lng: 106.660172 },
  height = "300px",
  showCurrentLocationButton = true 
}) => {
  const GOONG_API_KEY = '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj';
  const GOONG_BASE_URL = 'https://rsapi.goong.io';

  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(initialLocation);
  const [address, setAddress] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // 初始化地图
  const initializeMap = () => {
    if (!window.goong || !mapRef.current) return;

    try {
      // 创建地图实例
      const mapInstance = new window.goong.Map({
        container: mapRef.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: [currentLocation.lng, currentLocation.lat],
        zoom: 15
      });

      // 创建标记
      const markerInstance = new window.goong.Marker({
        draggable: true
      })
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .addTo(mapInstance);

      // 地图点击事件
      mapInstance.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        markerInstance.setLngLat([lng, lat]);
        setCurrentLocation({ lat, lng });
        handleLocationChange(lat, lng);
      });

      // 标记拖拽事件
      markerInstance.on('dragend', () => {
        const lngLat = markerInstance.getLngLat();
        setCurrentLocation({ lat: lngLat.lat, lng: lngLat.lng });
        handleLocationChange(lngLat.lat, lngLat.lng);
      });

      mapInstance.on('load', () => {
        setIsLoading(false);
        // 初始化时获取地址
        handleLocationChange(currentLocation.lat, currentLocation.lng);
      });

      setMap(mapInstance);
      setMarker(markerInstance);
      mapInstanceRef.current = mapInstance;

    } catch (error) {
      console.error('Map initialization error:', error);
      setIsLoading(false);
    }
  };

  // 处理位置变化
  const handleLocationChange = async (lat, lng) => {
    try {
      // 使用工具函数进行反向地理编码
      const addressData = await reverseGeocode(lat, lng);

      setAddress(addressData.formatted_address);

      if (onLocationSelect) {
        onLocationSelect({
          ...addressData,
          coordinates: { lat, lng }
        });
      }
    } catch (error) {
      console.error('Location change error:', error);
    }
  };

  // 获取当前位置
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        
        setCurrentLocation(newLocation);
        
        if (map && marker) {
          map.setCenter([longitude, latitude]);
          marker.setLngLat([longitude, latitude]);
          handleLocationChange(latitude, longitude);
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Không thể lấy vị trí hiện tại');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // 加载Goong Maps API
  useEffect(() => {
    if (window.goong) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js';
    script.async = true;

    script.onload = () => {
      const link = document.createElement('link');
      link.href = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      setTimeout(() => {
        if (window.goong) {
          window.goong.accessToken = GOONG_API_KEY;
          initializeMap();
        }
      }, 100);
    };

    script.onerror = () => {
      console.error('Failed to load Goong Maps API');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  // 更新地图中心点
  useEffect(() => {
    if (map && marker) {
      map.setCenter([currentLocation.lng, currentLocation.lat]);
      marker.setLngLat([currentLocation.lng, currentLocation.lat]);
    }
  }, [currentLocation, map, marker]);

  return (
    <div className="location-picker" style={{ height }}>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <div className="loading-text">Đang tải bản đồ...</div>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="map-container" style={{ height: '100%' }} />
      
      {showCurrentLocationButton && (
        <button
          className="current-location-btn"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          title="Lấy vị trí hiện tại"
        >
          {isGettingLocation ? (
            <div className="btn-spinner"></div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>
      )}
      
      {address && (
        <div className="address-display">
          <div className="address-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="address-text">{address}</div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
