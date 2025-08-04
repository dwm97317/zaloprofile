import React, { useState, useCallback, useEffect } from 'react';
import InteractiveMap, { Marker, NavigationControl, GeolocateControl } from '@goongmaps/goong-map-react';
import PropTypes from 'prop-types';
import { reverseGeocode } from '../../utils/addressParser';
import './index.scss';

// 配置常量
const CONFIG = {
  // 使用经过测试的正确API密钥
  GOONG_API_KEY: '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj', // 正确的密钥
  FALLBACK_API_KEY: '7nGVvNpejuF0maLfRDz5T1tWxubVwTzLpSlTBNHI', // 备用密钥（无权限）
  DEFAULT_CENTER: { lat: 10.762622, lng: 106.660172 }, // 胡志明市中心
  DEFAULT_ZOOM: 15,
  MAP_STYLE: 'https://tiles.goong.io/assets/goong_map_web.json'
};

const GoongMapReact = ({ 
  onLocationSelect, 
  initialLocation, 
  height = 300,
  showControls = true,
  className = ''
}) => {
  // 地图视口状态
  const [viewport, setViewport] = useState({
    latitude: initialLocation?.lat || CONFIG.DEFAULT_CENTER.lat,
    longitude: initialLocation?.lng || CONFIG.DEFAULT_CENTER.lng,
    zoom: CONFIG.DEFAULT_ZOOM,
    width: '100%',
    height: height
  });

  // 标记位置状态
  const [markerLocation, setMarkerLocation] = useState({
    latitude: initialLocation?.lat || CONFIG.DEFAULT_CENTER.lat,
    longitude: initialLocation?.lng || CONFIG.DEFAULT_CENTER.lng
  });

  // 加载和错误状态
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentApiKey, setCurrentApiKey] = useState(CONFIG.GOONG_API_KEY);

  // 处理地图点击事件
  const handleMapClick = useCallback(async (event) => {
    const { lngLat } = event;
    const newLocation = {
      latitude: lngLat[1],
      longitude: lngLat[0]
    };

    setMarkerLocation(newLocation);
    setIsLoading(true);
    setError(null);

    try {
      // 执行反向地理编码
      const addressData = await reverseGeocode(lngLat[1], lngLat[0]);
      
      if (onLocationSelect) {
        onLocationSelect({
          ...addressData,
          coordinates: { lat: lngLat[1], lng: lngLat[0] }
        });
      }
    } catch (error) {
      console.error('反向地理编码失败:', error);
      setError('获取地址信息失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [onLocationSelect]);

  // 处理标记拖拽
  const handleMarkerDrag = useCallback(async (event) => {
    const { lngLat } = event;
    const newLocation = {
      latitude: lngLat[1],
      longitude: lngLat[0]
    };

    setMarkerLocation(newLocation);
    
    // 拖拽结束时执行反向地理编码
    if (event.type === 'dragend') {
      setIsLoading(true);
      setError(null);

      try {
        const addressData = await reverseGeocode(lngLat[1], lngLat[0]);
        
        if (onLocationSelect) {
          onLocationSelect({
            ...addressData,
            coordinates: { lat: lngLat[1], lng: lngLat[0] }
          });
        }
      } catch (error) {
        console.error('反向地理编码失败:', error);
        setError('获取地址信息失败，请重试');
      } finally {
        setIsLoading(false);
      }
    }
  }, [onLocationSelect]);

  // 处理地理定位成功
  const handleGeolocate = useCallback(async (event) => {
    const { coords } = event;
    const newLocation = {
      latitude: coords.latitude,
      longitude: coords.longitude
    };

    setMarkerLocation(newLocation);
    setViewport(prev => ({
      ...prev,
      latitude: coords.latitude,
      longitude: coords.longitude,
      zoom: 16
    }));

    setIsLoading(true);
    setError(null);

    try {
      const addressData = await reverseGeocode(coords.latitude, coords.longitude);
      
      if (onLocationSelect) {
        onLocationSelect({
          ...addressData,
          coordinates: { lat: coords.latitude, lng: coords.longitude }
        });
      }
    } catch (error) {
      console.error('反向地理编码失败:', error);
      setError('获取地址信息失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [onLocationSelect]);

  // 处理地图加载错误
  const handleMapError = useCallback((error) => {
    console.error('地图加载错误:', error);
    
    // 如果是API密钥错误，尝试使用备用密钥
    if (error.message && error.message.includes('401') && currentApiKey === CONFIG.GOONG_API_KEY) {
      console.log('尝试使用备用API密钥...');
      setCurrentApiKey(CONFIG.FALLBACK_API_KEY);
      return;
    }
    
    setError('地图加载失败，请检查网络连接或刷新页面重试');
  }, [currentApiKey]);

  // 加载Goong CSS
  useEffect(() => {
    const loadGoongCSS = () => {
      if (!document.querySelector('link[href*="goong-js.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js/dist/goong-js.css';
        document.head.appendChild(link);
      }
    };

    loadGoongCSS();
  }, []);

  // 当初始位置改变时更新地图
  useEffect(() => {
    if (initialLocation) {
      setViewport(prev => ({
        ...prev,
        latitude: initialLocation.lat,
        longitude: initialLocation.lng
      }));
      setMarkerLocation({
        latitude: initialLocation.lat,
        longitude: initialLocation.lng
      });
    }
  }, [initialLocation]);

  return (
    <div
      className={`goong-map-react ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {error && (
        <div className="map-error">
          <span className="error-text">{error}</span>
          <button
            className="retry-button"
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
          >
            重试
          </button>
        </div>
      )}

      {isLoading && (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <span>正在获取地址信息...</span>
        </div>
      )}

      <InteractiveMap
        {...viewport}
        mapStyle={CONFIG.MAP_STYLE}
        onViewportChange={setViewport}
        onClick={handleMapClick}
        onError={handleMapError}
        goongApiAccessToken={currentApiKey}
        attributionControl={false}
        width="100%"
        height="100%"
      >
        {/* 位置标记 */}
        <Marker
          latitude={markerLocation.latitude}
          longitude={markerLocation.longitude}
          draggable={true}
          onDrag={handleMarkerDrag}
          onDragEnd={handleMarkerDrag}
        >
          <div className="map-marker">
            <div className="marker-pin"></div>
            <div className="marker-pulse"></div>
          </div>
        </Marker>

        {/* 地图控件 */}
        {showControls && (
          <>
            <div className="map-controls">
              <NavigationControl showCompass={false} />
            </div>
            
            <div className="geolocate-control">
              <GeolocateControl
                positionOptions={{ enableHighAccuracy: true }}
                trackUserLocation={false}
                showUserLocation={false}
                onGeolocate={handleGeolocate}
              />
            </div>
          </>
        )}
      </InteractiveMap>

      <div className="map-instructions">
        <span>点击地图或拖拽标记来选择位置</span>
      </div>
    </div>
  );
};

GoongMapReact.propTypes = {
  onLocationSelect: PropTypes.func,
  initialLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  showControls: PropTypes.bool,
  className: PropTypes.string
};

export default GoongMapReact;
