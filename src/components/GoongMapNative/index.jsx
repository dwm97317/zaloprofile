import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { reverseGeocode } from '../../utils/addressParser';
import './index.scss';

// 配置常量
const CONFIG = {
  GOONG_API_KEY: '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj',
  DEFAULT_CENTER: [106.660172, 10.762622], // [lng, lat] 胡志明市中心
  DEFAULT_ZOOM: 15,
  MAP_STYLE: 'https://tiles.goong.io/assets/goong_map_web.json'
};

const GoongMapNative = ({ 
  onLocationSelect, 
  initialLocation, 
  height = 300,
  showControls = true,
  className = ''
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 初始化地图
  const initializeMap = useCallback(() => {
    if (!mapContainer.current || map.current) return;

    try {
      // 确保Goong Maps SDK已加载
      if (typeof window.goongjs === 'undefined') {
        setError('Goong Maps SDK未加载');
        return;
      }

      window.goongjs.accessToken = CONFIG.GOONG_API_KEY;

      const initialCenter = initialLocation 
        ? [initialLocation.lng, initialLocation.lat]
        : CONFIG.DEFAULT_CENTER;

      map.current = new window.goongjs.Map({
        container: mapContainer.current,
        style: CONFIG.MAP_STYLE,
        center: initialCenter,
        zoom: CONFIG.DEFAULT_ZOOM
      });

      // 添加标记
      marker.current = new window.goongjs.Marker({
        draggable: true
      })
        .setLngLat(initialCenter)
        .addTo(map.current);

      // 地图点击事件
      map.current.on('click', handleMapClick);

      // 标记拖拽事件
      marker.current.on('dragend', handleMarkerDragEnd);

      // 地图加载完成事件
      map.current.on('load', () => {
        setMapLoaded(true);
        setError(null);
      });

      // 地图错误事件
      map.current.on('error', (e) => {
        console.error('地图加载错误:', e);
        setError('地图加载失败，请检查网络连接');
      });

      // 添加控件
      if (showControls) {
        map.current.addControl(new window.goongjs.NavigationControl(), 'top-right');
        
        // 添加定位控件
        const geolocateControl = new window.goongjs.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: false,
          showUserLocation: false
        });
        
        geolocateControl.on('geolocate', handleGeolocate);
        map.current.addControl(geolocateControl, 'top-right');
      }

    } catch (error) {
      console.error('地图初始化失败:', error);
      setError('地图初始化失败');
    }
  }, [initialLocation, showControls]);

  // 处理地图点击
  const handleMapClick = useCallback(async (e) => {
    const { lng, lat } = e.lngLat;
    
    // 移动标记到点击位置
    if (marker.current) {
      marker.current.setLngLat([lng, lat]);
    }

    await performReverseGeocode(lat, lng);
  }, []);

  // 处理标记拖拽结束
  const handleMarkerDragEnd = useCallback(async () => {
    if (!marker.current) return;
    
    const lngLat = marker.current.getLngLat();
    await performReverseGeocode(lngLat.lat, lngLat.lng);
  }, []);

  // 处理地理定位
  const handleGeolocate = useCallback(async (e) => {
    const { coords } = e;
    const { latitude, longitude } = coords;

    // 移动地图和标记到当前位置
    if (map.current) {
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 16
      });
    }

    if (marker.current) {
      marker.current.setLngLat([longitude, latitude]);
    }

    await performReverseGeocode(latitude, longitude);
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

  // 加载Goong Maps SDK
  useEffect(() => {
    const loadGoongMapsSDK = () => {
      // 检查是否已经加载
      if (window.goongjs) {
        initializeMap();
        return;
      }

      // 加载CSS
      if (!document.querySelector('link[href*="goong-js.css"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js/dist/goong-js.css';
        document.head.appendChild(cssLink);
      }

      // 加载JavaScript
      if (!document.querySelector('script[src*="goong-js"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js/dist/goong-js.js';
        script.onload = () => {
          initializeMap();
        };
        script.onerror = () => {
          setError('无法加载地图SDK');
        };
        document.head.appendChild(script);
      }
    };

    loadGoongMapsSDK();

    // 清理函数
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initializeMap]);

  // 当初始位置改变时更新地图
  useEffect(() => {
    if (map.current && marker.current && initialLocation) {
      const newCenter = [initialLocation.lng, initialLocation.lat];
      map.current.flyTo({ center: newCenter });
      marker.current.setLngLat(newCenter);
    }
  }, [initialLocation]);

  return (
    <div 
      className={`goong-map-native ${className}`}
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

      <div 
        ref={mapContainer} 
        className="map-container"
        style={{ width: '100%', height: '100%' }}
      />

      {!mapLoaded && !error && (
        <div className="map-loading-initial">
          <div className="loading-spinner"></div>
          <span>正在加载地图...</span>
        </div>
      )}

      <div className="map-instructions">
        <span>点击地图或拖拽标记来选择位置</span>
      </div>
    </div>
  );
};

GoongMapNative.propTypes = {
  onLocationSelect: PropTypes.func,
  initialLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  showControls: PropTypes.bool,
  className: PropTypes.string
};

export default GoongMapNative;
