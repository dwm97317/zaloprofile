import React, { useState, useCallback, useRef } from 'react';
import { StaticMap, Marker } from '@goongmaps/goong-map-react';
import PropTypes from 'prop-types';
import { reverseGeocode } from '../../utils/addressParser';
import './index.scss';

// 配置常量
const CONFIG = {
  GOONG_API_KEY: '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj',
  DEFAULT_CENTER: { lat: 10.762622, lng: 106.660172 }, // 胡志明市中心
  DEFAULT_ZOOM: 15,
  MAP_STYLE: 'https://tiles.goong.io/assets/goong_map_web.json'
};

const GoongStaticMap = ({ 
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
  
  const mapRef = useRef(null);

  // 处理地图点击
  const handleMapClick = useCallback(async (event) => {
    const { lngLat } = event;
    const newLocation = { lat: lngLat[1], lng: lngLat[0] };
    
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

  // 处理地图错误
  const handleMapError = useCallback((error) => {
    console.error('地图错误:', error);
    setError('地图加载失败，请检查网络连接');
  }, []);

  return (
    <div 
      className={`goong-static-map ${className}`}
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
        <StaticMap
          ref={mapRef}
          width="100%"
          height="100%"
          latitude={currentLocation.lat}
          longitude={currentLocation.lng}
          zoom={zoom}
          mapStyle={CONFIG.MAP_STYLE}
          goongApiAccessToken={CONFIG.GOONG_API_KEY}
          onClick={handleMapClick}
          onError={handleMapError}
          attributionControl={false}
        >
          {/* 地图标记 */}
          <Marker
            latitude={currentLocation.lat}
            longitude={currentLocation.lng}
            offsetLeft={-12}
            offsetTop={-24}
          >
            <div className="map-marker">
              <div className="marker-pin"></div>
              <div className="marker-pulse"></div>
            </div>
          </Marker>
        </StaticMap>

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

GoongStaticMap.propTypes = {
  onLocationSelect: PropTypes.func,
  initialLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string
};

export default GoongStaticMap;
