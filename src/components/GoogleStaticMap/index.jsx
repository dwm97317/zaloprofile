import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { reverseGeocode } from '../../utils/addressParser';
import './index.scss';

// 配置常量
const CONFIG = {
  DEFAULT_CENTER: { lat: 10.762622, lng: 106.660172 }, // 胡志明市中心
  DEFAULT_ZOOM: 15,
  GOONG_API_KEY: '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj'
};

const GoogleEmbedMap = ({
  onLocationSelect,
  initialLocation,
  height = 300,
  className = ''
}) => {
  const [currentLocation, setCurrentLocation] = useState(
    initialLocation || CONFIG.DEFAULT_CENTER
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(CONFIG.DEFAULT_ZOOM);
  const [mapUrl, setMapUrl] = useState('');

  const mapRef = useRef(null);

  // 生成Google Maps嵌入URL
  const generateMapUrl = useCallback((center, zoomLevel) => {
    const { lat, lng } = center;

    // Google Maps embed URL格式
    // https://maps.google.com/maps?q=lat,lng&t=&z=zoom&ie=UTF8&iwloc=&output=embed
    return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;
  }, []);

  // 更新地图URL
  useEffect(() => {
    const newUrl = generateMapUrl(currentLocation, zoom);
    setMapUrl(newUrl);
  }, [currentLocation, zoom, generateMapUrl]);

  // 处理地图位置更新（通过控件）
  const handleLocationUpdate = useCallback(async (newLocation) => {
    setCurrentLocation(newLocation);
    await performReverseGeocode(newLocation.lat, newLocation.lng);
  }, []);

  // 执行反向地理编码
  const performReverseGeocode = useCallback(async (lat, lng) => {
    setIsLoading(true);
    setError(null);

    try {
      const addressData = await reverseGeocode(lat, lng);
      
      if (onLocationSelect) {
        onLocationSelect({
          ...addressData,
          coordinates: { lat, lng }
        });
      }
    } catch (error) {
      console.error('反向地理编码失败:', error);
      setError('获取地址信息失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [onLocationSelect]);

  // 处理缩放
  const handleZoomIn = useCallback(() => {
    if (zoom < 20) {
      setZoom(prev => prev + 1);
    }
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    if (zoom > 1) {
      setZoom(prev => prev - 1);
    }
  }, [zoom]);

  // 处理定位
  const handleCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('浏览器不支持地理定位');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };

          setCurrentLocation(newLocation);
          setZoom(16);

          await performReverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error('定位失败:', error);
          setError('定位失败，请检查定位权限');
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } catch (error) {
      console.error('定位错误:', error);
      setError('定位功能不可用');
      setIsLoading(false);
    }
  }, [performReverseGeocode]);

  // 处理地图加载错误
  const handleMapError = useCallback(() => {
    setError('地图加载失败，请检查网络连接');
  }, []);

  // 当初始位置改变时更新
  useEffect(() => {
    if (initialLocation) {
      setCurrentLocation(initialLocation);
    }
  }, [initialLocation]);

  // 处理手动输入坐标
  const handleCoordinateInput = useCallback(async () => {
    const lat = prompt('请输入纬度 (例如: 10.762622):');
    const lng = prompt('请输入经度 (例如: 106.660172):');

    if (lat && lng) {
      const newLat = parseFloat(lat);
      const newLng = parseFloat(lng);

      if (!isNaN(newLat) && !isNaN(newLng)) {
        const newLocation = { lat: newLat, lng: newLng };
        await handleLocationUpdate(newLocation);
      } else {
        setError('请输入有效的坐标');
      }
    }
  }, [handleLocationUpdate]);

  return (
    <div
      className={`google-embed-map ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {error && (
        <div className="map-error">
          <span className="error-text">{error}</span>
          <button 
            className="retry-button"
            onClick={() => setError(null)}
          >
            关闭
          </button>
        </div>
      )}
      
      {isLoading && (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <span>正在获取地址信息...</span>
        </div>
      )}

      <div className="map-container">
        {/* 使用iframe嵌入Google Maps */}
        <iframe
          ref={mapRef}
          src={mapUrl}
          className="map-iframe"
          title="Google地图"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          onError={handleMapError}
          onLoad={() => setError(null)}
        />

        {/* 地图控件 */}
        <div className="map-controls">
          <button 
            className="control-button zoom-in"
            onClick={handleZoomIn}
            disabled={zoom >= 20}
          >
            +
          </button>
          <button 
            className="control-button zoom-out"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
          >
            -
          </button>
          <button
            className="control-button location-btn"
            onClick={handleCurrentLocation}
            disabled={isLoading}
            title="获取当前位置"
          >
            📍
          </button>
          <button
            className="control-button coordinate-btn"
            onClick={handleCoordinateInput}
            disabled={isLoading}
            title="手动输入坐标"
          >
            📌
          </button>
        </div>
      </div>

      <div className="map-instructions">
        <span>使用控件调整位置和缩放 | 缩放: {zoom}</span>
      </div>

      <div className="location-info">
        <span>当前位置: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</span>
      </div>
    </div>
  );
};

GoogleEmbedMap.propTypes = {
  onLocationSelect: PropTypes.func,
  initialLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string
};

export default GoogleEmbedMap;
