import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Sheet } from 'zmp-ui';
import request from '../../utils/request';
import './style.scss';

const GoongAddressPicker = ({ visible, onClose, onSelect, defaultAddress = {} }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(defaultAddress);
  const [showMap, setShowMap] = useState(false);
  const searchTimeout = useRef(null);

  /**
   * 搜索地址建议
   */
  const searchAddresses = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await request.get(`goong_address/autocomplete`, {
        input: query,
        limit: 10
      });

      if (response.code === 1) {
        setSuggestions(response.data.suggestions || []);
      } else {
        console.error('地址搜索失败:', response.msg);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('地址搜索错误:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取地点详情
   */
  const getPlaceDetail = async (placeId) => {
    setLoading(true);
    try {
      const response = await request.get(`goong_address/place_detail`, {
        place_id: placeId
      });

      if (response.code === 1 && response.data.place) {
        const place = response.data.place;
        const vietnameseAddress = place.vietnamese_address || {};
        
        const addressData = {
          place_id: place.place_id,
          formatted_address: place.formatted_address,
          province: vietnameseAddress.province || '',
          district: vietnameseAddress.district || '',
          ward: vietnameseAddress.ward || '',
          street: vietnameseAddress.street || '',
          house_number: vietnameseAddress.house_number || '',
          latitude: place.geometry?.location?.lat || '',
          longitude: place.geometry?.location?.lng || ''
        };

        setSelectedAddress(addressData);
        return addressData;
      }
    } catch (error) {
      console.error('获取地点详情失败:', error);
    } finally {
      setLoading(false);
    }
    return null;
  };

  /**
   * 反向地理编码
   */
  const reverseGeocode = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await request.get(`goong_address/reverse_geocode`, {
        lat: lat,
        lng: lng
      });

      if (response.code === 1 && response.data.address) {
        const address = response.data.address;
        const vietnameseAddress = address.vietnamese_address || {};
        
        const addressData = {
          formatted_address: address.formatted_address,
          province: vietnameseAddress.province || '',
          district: vietnameseAddress.district || '',
          ward: vietnameseAddress.ward || '',
          street: vietnameseAddress.street || '',
          house_number: vietnameseAddress.house_number || '',
          latitude: lat,
          longitude: lng
        };

        setSelectedAddress(addressData);
        return addressData;
      }
    } catch (error) {
      console.error('反向地理编码失败:', error);
    } finally {
      setLoading(false);
    }
    return null;
  };

  /**
   * 搜索输入处理
   */
  const handleSearchInput = (value) => {
    setSearchQuery(value);
    
    // 防抖搜索
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      searchAddresses(value);
    }, 300);
  };

  /**
   * 选择地址建议
   */
  const handleSuggestionSelect = async (suggestion) => {
    const addressData = await getPlaceDetail(suggestion.place_id);
    if (addressData) {
      setSearchQuery(addressData.formatted_address);
      setSuggestions([]);
    }
  };

  /**
   * 确认选择
   */
  const handleConfirm = () => {
    if (selectedAddress.province && selectedAddress.district && selectedAddress.ward) {
      // 格式化为旧系统兼容的格式
      const formattedData = {
        selectedProvinceName: selectedAddress.province,
        selectedCityName: selectedAddress.district,
        selectedWardName: selectedAddress.ward,
        street: selectedAddress.street,
        house_number: selectedAddress.house_number,
        formatted_address: selectedAddress.formatted_address,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude
      };

      onSelect && onSelect(formattedData);
      onClose && onClose();
    } else {
      alert('请选择完整的地址信息');
    }
  };

  /**
   * 获取当前位置
   */
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error('获取位置失败:', error);
          alert('无法获取当前位置，请手动搜索地址');
        }
      );
    } else {
      alert('浏览器不支持地理定位');
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  return (
    <Sheet 
      visible={visible} 
      onClose={onClose}
      title="选择地址"
      height="80vh"
    >
      <div className="goong-address-picker">
        {/* 搜索栏 */}
        <div className="search-section">
          <div className="search-bar">
            <Input
              placeholder="Nhập địa chỉ để tìm kiếm..."
              value={searchQuery}
              onInput={(e) => handleSearchInput(e.target.value)}
              suffix={loading && <span className="loading-icon">⏳</span>}
            />
          </div>
          
          <div className="action-buttons">
            <Button 
              size="small" 
              type="secondary"
              onClick={getCurrentLocation}
            >
              📍 Vị trí hiện tại
            </Button>
          </div>
        </div>

        {/* 地址建议列表 */}
        {suggestions.length > 0 && (
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="main-text">
                  {suggestion.structured_formatting?.main_text || suggestion.description}
                </div>
                <div className="secondary-text">
                  {suggestion.structured_formatting?.secondary_text || ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 选中的地址信息 */}
        {selectedAddress.formatted_address && (
          <div className="selected-address">
            <h3>Địa chỉ đã chọn:</h3>
            <div className="address-info">
              <p><strong>Địa chỉ đầy đủ:</strong> {selectedAddress.formatted_address}</p>
              {selectedAddress.province && (
                <p><strong>Tỉnh/Thành phố:</strong> {selectedAddress.province}</p>
              )}
              {selectedAddress.district && (
                <p><strong>Quận/Huyện:</strong> {selectedAddress.district}</p>
              )}
              {selectedAddress.ward && (
                <p><strong>Phường/Xã:</strong> {selectedAddress.ward}</p>
              )}
              {selectedAddress.street && (
                <p><strong>Đường:</strong> {selectedAddress.street}</p>
              )}
              {selectedAddress.house_number && (
                <p><strong>Số nhà:</strong> {selectedAddress.house_number}</p>
              )}
            </div>
          </div>
        )}

        {/* 底部按钮 */}
        <div className="bottom-actions">
          <Button 
            type="secondary" 
            onClick={onClose}
            style={{ marginRight: '10px' }}
          >
            Hủy
          </Button>
          <Button 
            type="primary" 
            onClick={handleConfirm}
            disabled={!selectedAddress.province}
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </Sheet>
  );
};

export default GoongAddressPicker;