import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { reverseGeocode } from '../../utils/addressParser';
import './index.scss';

// 配置常量
const CONFIG = {
  DEFAULT_CENTER: { lat: 10.762622, lng: 106.660172 }, // 胡志明市中心
  DEFAULT_ZOOM: 15,
  MAP_SIZE: { width: 600, height: 400 }
};

const BasicMapPicker = ({ 
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

  // 生成地图背景图片 - 使用简单的网格图案
  const generateMapBackground = useCallback(() => {
    // 创建一个简单的地图样式背景
    const canvas = document.createElement('canvas');
    canvas.width = CONFIG.MAP_SIZE.width;
    canvas.height = CONFIG.MAP_SIZE.height;
    const ctx = canvas.getContext('2d');
    
    // 绘制地图背景
    ctx.fillStyle = '#e8f4f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格线
    ctx.strokeStyle = '#d0e8f0';
    ctx.lineWidth = 1;
    
    const gridSize = 20;
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // 绘制一些模拟的街道
    ctx.strokeStyle = '#b8d4e0';
    ctx.lineWidth = 2;
    
    // 水平街道
    for (let i = 1; i < 10; i++) {
      const y = (canvas.height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // 垂直街道
    for (let i = 1; i < 15; i++) {
      const x = (canvas.width / 15) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // 添加一些地标点
    ctx.fillStyle = '#4a90a4';
    const landmarks = [
      { x: 150, y: 100 },
      { x: 300, y: 200 },
      { x: 450, y: 150 },
      { x: 200, y: 300 },
      { x: 400, y: 320 }
    ];
    
    landmarks.forEach(landmark => {
      ctx.beginPath();
      ctx.arc(landmark.x, landmark.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    return canvas.toDataURL();
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

  return (
    <div 
      className={`basic-map-picker ${className}`}
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
        <div
          ref={mapRef}
          className="map-background"
          style={{
            backgroundImage: `url(${generateMapBackground()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onClick={handleMapClick}
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

BasicMapPicker.propTypes = {
  onLocationSelect: PropTypes.func,
  initialLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string
};

export default BasicMapPicker;
