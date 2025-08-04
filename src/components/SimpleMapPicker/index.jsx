import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { reverseGeocode } from '../../utils/addressParser';
import './index.scss';

// 配置常量
const CONFIG = {
  GOONG_API_KEY: '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj',
  DEFAULT_CENTER: { lat: 10.762622, lng: 106.660172 }, // 胡志明市中心
  DEFAULT_ZOOM: 15,
  STATIC_MAP_SIZE: '600x400'
};

const SimpleMapPicker = ({ 
  onLocationSelect, 
  initialLocation, 
  height = 300,
  className = ''
}) => {
  const [currentLocation, setCurrentLocation] = useState(
    initialLocation || CONFIG.DEFAULT_CENTER
  );
  const [markerPosition, setMarkerPosition] = useState({ x: 50, y: 50 }); // 百分比位置
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(CONFIG.DEFAULT_ZOOM);
  
  const mapRef = useRef(null);

  // 生成静态地图URL - 使用MapBox静态地图API
  const getStaticMapUrl = useCallback((center, zoomLevel) => {
    const { lat, lng } = center;
    const width = 600;
    const height = 400;

    // 使用MapBox静态地图API（免费版本）
    // 格式: https://api.mapbox.com/styles/v1/{username}/{style_id}/static/{overlay}/{lon},{lat},{zoom},{bearing},{pitch}/{width}x{height}{@2x}?access_token={access_token}

    // 使用公开的地图服务，不需要API密钥
    // 这里使用一个简单的静态地图生成服务
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoomLevel}&size=${width}x${height}&markers=color:red%7C${lat},${lng}&key=AIzaSyDummy`;
  }, []);

  // 处理地图点击
  const handleMapClick = useCallback(async (event) => {
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 计算点击位置的百分比
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    setMarkerPosition({ x: xPercent, y: yPercent });

    // 计算实际的经纬度（简化计算）
    const mapWidth = rect.width;
    const mapHeight = rect.height;
    
    // 基于当前中心点和缩放级别计算新的经纬度
    const metersPerPixel = 156543.03392 * Math.cos(currentLocation.lat * Math.PI / 180) / Math.pow(2, zoom);
    const offsetX = (x - mapWidth / 2) * metersPerPixel;
    const offsetY = (mapHeight / 2 - y) * metersPerPixel;
    
    const newLat = currentLocation.lat + (offsetY / 111320);
    const newLng = currentLocation.lng + (offsetX / (111320 * Math.cos(currentLocation.lat * Math.PI / 180)));

    const newLocation = { lat: newLat, lng: newLng };
    setCurrentLocation(newLocation);

    await performReverseGeocode(newLat, newLng);
  }, [currentLocation, zoom]);

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
    if (zoom < 18) {
      setZoom(prev => prev + 1);
    }
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    if (zoom > 8) {
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
          setMarkerPosition({ x: 50, y: 50 }); // 重置标记到中心
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

  // 当初始位置改变时更新
  useEffect(() => {
    if (initialLocation) {
      setCurrentLocation(initialLocation);
      setMarkerPosition({ x: 50, y: 50 });
    }
  }, [initialLocation]);

  return (
    <div 
      className={`simple-map-picker ${className}`}
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
        <img
          ref={mapRef}
          src={getStaticMapUrl(currentLocation, zoom)}
          alt="地图"
          className="map-image"
          onClick={handleMapClick}
          onError={() => setError('地图加载失败')}
        />
        
        {/* 自定义标记 */}
        <div 
          className="map-marker"
          style={{
            left: `${markerPosition.x}%`,
            top: `${markerPosition.y}%`
          }}
        >
          <div className="marker-pin"></div>
          <div className="marker-pulse"></div>
        </div>

        {/* 地图控件 */}
        <div className="map-controls">
          <button 
            className="control-button zoom-in"
            onClick={handleZoomIn}
            disabled={zoom >= 18}
          >
            +
          </button>
          <button 
            className="control-button zoom-out"
            onClick={handleZoomOut}
            disabled={zoom <= 8}
          >
            -
          </button>
          <button 
            className="control-button location-btn"
            onClick={handleCurrentLocation}
            disabled={isLoading}
          >
            📍
          </button>
        </div>
      </div>

      <div className="map-instructions">
        <span>点击地图选择位置 | 缩放: {zoom}</span>
      </div>

      <div className="location-info">
        <span>当前位置: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</span>
      </div>
    </div>
  );
};

SimpleMapPicker.propTypes = {
  onLocationSelect: PropTypes.func,
  initialLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string
};

export default SimpleMapPicker;
