import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

// 配置常量
const CONFIG = {
  GOONG_API_KEY: process.env.REACT_APP_GOONG_API_KEY || '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj', // 应该从环境变量获取
  GOONG_CDN_URL: 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js',
  GOONG_CSS_URL: 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css',
  DEFAULT_CENTER: { lat: 10.762622, lng: 106.660172 }, // 胡志明市中心
  DEFAULT_ZOOM: 15,
  MAX_RETRY_ATTEMPTS: 3,
  LOAD_TIMEOUT: 10000,
  DEBOUNCE_DELAY: 300
};

// 地图主题配置
const MAP_STYLES = {
  default: 'https://tiles.goong.io/assets/goong_map_web.json',
  satellite: 'https://tiles.goong.io/assets/goong_map_satellite.json',
  terrain: 'https://tiles.goong.io/assets/goong_map_terrain.json'
};

/**
 * 防抖函数
 */
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

/**
 * GoongMap 组件 - 优化版本
 */
const GoongMap = ({ 
  center = CONFIG.DEFAULT_CENTER, 
  zoom = CONFIG.DEFAULT_ZOOM, 
  onLocationChange,
  onMapReady,
  onError,
  showMarker = true,
  markerDraggable = true,
  height = '300px',
  mapStyle = 'default',
  showControls = true,
  showCurrentLocationBtn = false,
  className = '',
  disabled = false,
  maxZoom = 18,
  minZoom = 1
}) => {
  // 状态管理
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(center);
  
  // 防抖处理位置变化
  const debouncedLocationChange = useDebounce((location) => {
    onLocationChange && onLocationChange(location);
  }, CONFIG.DEBOUNCE_DELAY);

  // 记忆化的地图样式URL
  const mapStyleUrl = useMemo(() => MAP_STYLES[mapStyle] || MAP_STYLES.default, [mapStyle]);

  // 错误处理
  const handleError = useCallback((errorMsg, details = null) => {
    console.error('GoongMap Error:', errorMsg, details);
    setError(errorMsg);
    setIsLoading(false);
    onError && onError(errorMsg, details);
  }, [onError]);

  // 加载Goong Maps API
  const loadGoongMaps = useCallback(async () => {
    if (window.goong) {
      initializeMap();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 创建加载超时
      const timeoutId = setTimeout(() => {
        handleError('地图加载超时，请检查网络连接');
      }, CONFIG.LOAD_TIMEOUT);

      // 动态加载JavaScript
      const script = document.createElement('script');
      script.src = CONFIG.GOONG_CDN_URL;
      script.async = true;
      
      script.onload = () => {
        clearTimeout(timeoutId);
        
        // 加载CSS
        if (!document.querySelector(`link[href="${CONFIG.GOONG_CSS_URL}"]`)) {
          const link = document.createElement('link');
          link.href = CONFIG.GOONG_CSS_URL;
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }

        // 等待API完全加载
        const checkGoongReady = () => {
          if (window.goong && window.goong.Map) {
            window.goong.accessToken = CONFIG.GOONG_API_KEY;
            initializeMap();
          } else {
            setTimeout(checkGoongReady, 100);
          }
        };
        checkGoongReady();
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        if (retryCount < CONFIG.MAX_RETRY_ATTEMPTS) {
          setRetryCount(prev => prev + 1);
          setTimeout(loadGoongMaps, 1000 * (retryCount + 1)); // 递增延迟重试
        } else {
          handleError('无法加载地图服务，请稍后重试');
        }
      };

      document.head.appendChild(script);
    } catch (error) {
      handleError('地图初始化失败', error);
    }
  }, [retryCount, handleError]);

  // 初始化地图
  const initializeMap = useCallback(() => {
    if (!mapRef.current || map || !window.goong) return;

    try {
      const newMap = new window.goong.Map({
        container: mapRef.current,
        style: mapStyleUrl,
        center: [center.lng, center.lat],
        zoom: zoom,
        maxZoom: maxZoom,
        minZoom: minZoom,
        attributionControl: showControls,
        navigationControl: showControls
      });

      // 地图加载完成事件
      newMap.on('load', () => {
        setIsLoaded(true);
        setIsLoading(false);
        setError(null);
        
        // 初始化标记
        if (showMarker) {
          initializeMarker(newMap);
        }

        // 地图交互事件
        setupMapEvents(newMap);
        
        // 通知父组件地图已准备就绪
        onMapReady && onMapReady(newMap);
      });

      // 地图错误处理
      newMap.on('error', (e) => {
        handleError('地图渲染错误', e);
      });

      setMap(newMap);
    } catch (error) {
      handleError('地图创建失败', error);
    }
  }, [center, zoom, maxZoom, minZoom, mapStyleUrl, showControls, showMarker, map, onMapReady, handleError]);

  // 初始化标记
  const initializeMarker = useCallback((mapInstance) => {
    if (!showMarker) return;

    try {
      const newMarker = new window.goong.Marker({
        draggable: markerDraggable && !disabled,
        color: '#007bff'
      })
      .setLngLat([center.lng, center.lat])
      .addTo(mapInstance);

      // 标记拖拽事件
      if (markerDraggable && !disabled) {
        newMarker.on('dragend', () => {
          const lngLat = newMarker.getLngLat();
          const newPosition = {
            lat: lngLat.lat,
            lng: lngLat.lng
          };
          setCurrentPosition(newPosition);
          debouncedLocationChange(newPosition);
        });
      }

      setMarker(newMarker);
    } catch (error) {
      handleError('标记创建失败', error);
    }
  }, [showMarker, markerDraggable, disabled, center, debouncedLocationChange, handleError]);

  // 设置地图事件
  const setupMapEvents = useCallback((mapInstance) => {
    if (disabled) return;

    // 地图点击事件
    mapInstance.on('click', (e) => {
      if (showMarker && marker) {
        marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        const newPosition = {
          lat: e.lngLat.lat,
          lng: e.lngLat.lng
        };
        setCurrentPosition(newPosition);
        debouncedLocationChange(newPosition);
      }
    });

    // 地图缩放事件
    mapInstance.on('zoom', () => {
      // 可以添加缩放相关的逻辑
    });

    // 地图移动事件
    mapInstance.on('move', () => {
      // 可以添加移动相关的逻辑
    });
  }, [disabled, showMarker, marker, debouncedLocationChange]);

  // 获取当前位置
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      handleError('浏览器不支持地理定位');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPosition = { lat: latitude, lng: longitude };
        
        if (map) {
          map.setCenter([longitude, latitude]);
          if (marker) {
            marker.setLngLat([longitude, latitude]);
          }
        }
        
        setCurrentPosition(newPosition);
        debouncedLocationChange(newPosition);
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        handleError('无法获取当前位置', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5分钟缓存
      }
    );
  }, [map, marker, debouncedLocationChange, handleError]);

  // 重试加载
  const retryLoad = useCallback(() => {
    setRetryCount(0);
    setError(null);
    loadGoongMaps();
  }, [loadGoongMaps]);

  // 更新地图中心点
  useEffect(() => {
    if (map && isLoaded && center) {
      map.setCenter([center.lng, center.lat]);
      if (marker) {
        marker.setLngLat([center.lng, center.lat]);
      }
      setCurrentPosition(center);
    }
  }, [center, map, marker, isLoaded]);

  // 初始化
  useEffect(() => {
    loadGoongMaps();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [loadGoongMaps]);

  // 渲染组件
  return (
    <div className={`goong-map-container ${className} ${disabled ? 'disabled' : ''}`}>
      <div 
        ref={mapRef} 
        className="goong-map"
        style={{ height: height }}
      />
      
      {/* 加载状态 */}
      {isLoading && (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <span>Đang tải bản đồ...</span>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="map-error">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
          <button 
            className="retry-button"
            onClick={retryLoad}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* 当前位置按钮 */}
      {showCurrentLocationBtn && !disabled && (
        <button 
          className="current-location-btn"
          onClick={getCurrentLocation}
          disabled={isLoading}
        >
          📍
        </button>
      )}

      {/* 地图控制按钮 */}
      {showControls && !disabled && (
        <div className="map-controls">
          <button 
            className="zoom-in-btn"
            onClick={() => map && map.zoomIn()}
          >
            +
          </button>
          <button 
            className="zoom-out-btn"
            onClick={() => map && map.zoomOut()}
          >
            -
          </button>
        </div>
      )}
    </div>
  );
};

// PropTypes 定义
GoongMap.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }),
  zoom: PropTypes.number,
  onLocationChange: PropTypes.func,
  onMapReady: PropTypes.func,
  onError: PropTypes.func,
  showMarker: PropTypes.bool,
  markerDraggable: PropTypes.bool,
  height: PropTypes.string,
  mapStyle: PropTypes.oneOf(['default', 'satellite', 'terrain']),
  showControls: PropTypes.bool,
  showCurrentLocationBtn: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  maxZoom: PropTypes.number,
  minZoom: PropTypes.number
};

export default GoongMap;
