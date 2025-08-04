import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Sheet } from 'zmp-ui';
import axios from 'axios';
import './style.scss';

// Goong API 配置
const GOONG_API_KEY = '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj';
const GOONG_BASE_URL = 'https://rsapi.goong.io';

// 解析越南地址组件
const parseVietnameseAddress = (addressComponents) => {
  const result = {
    province: '',
    district: '',
    ward: '',
    street: '',
    house_number: ''
  };

  addressComponents.forEach(component => {
    const types = component.types || [];

    if (types.includes('administrative_area_level_1')) {
      result.province = component.long_name;
    } else if (types.includes('administrative_area_level_2')) {
      result.district = component.long_name;
    } else if (types.includes('administrative_area_level_3') || types.includes('sublocality_level_1')) {
      result.ward = component.long_name;
    } else if (types.includes('route')) {
      result.street = component.long_name;
    } else if (types.includes('street_number')) {
      result.house_number = component.long_name;
    }
  });

  return result;
};

const GoongAddressPicker = ({ visible, onClose, onSelect, defaultAddress = {} }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(defaultAddress);
  const [showMap, setShowMap] = useState(false);
  const searchTimeout = useRef(null);

  /**
   * 直接调用 Goong API 搜索地址建议
   */
  const searchAddresses = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${GOONG_BASE_URL}/Place/AutoComplete`, {
        params: {
          api_key: GOONG_API_KEY,
          input: query,
          limit: 10,
          location: '10.762622,106.660172', // 胡志明市中心坐标
          radius: 50000 // 50km 半径
        }
      });

      if (response.data && response.data.predictions) {
        setSuggestions(response.data.predictions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('地址搜索失败:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 直接调用 Goong API 获取地点详情
   */
  const getPlaceDetail = async (placeId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${GOONG_BASE_URL}/Place/Detail`, {
        params: {
          api_key: GOONG_API_KEY,
          place_id: placeId
        }
      });

      if (response.data && response.data.result) {
        const place = response.data.result;

        // 解析越南地址组件
        const addressComponents = place.address_components || [];
        const vietnameseAddress = parseVietnameseAddress(addressComponents);

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
   * 直接调用 Goong API 反向地理编码
   */
  const reverseGeocode = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await axios.get(`${GOONG_BASE_URL}/Geocode`, {
        params: {
          api_key: GOONG_API_KEY,
          latlng: `${lat},${lng}`
        }
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        const address = response.data.results[0];
        const addressComponents = address.address_components || [];
        const vietnameseAddress = parseVietnameseAddress(addressComponents);

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

      // 如果没有获取到完整的省市区信息，尝试从格式化地址中解析
      if (!addressData.province || !addressData.district) {
        const fallbackAddress = parseAddressFromFormatted(addressData.formatted_address);
        const mergedAddress = {
          ...addressData,
          province: addressData.province || fallbackAddress.province,
          district: addressData.district || fallbackAddress.district,
          ward: addressData.ward || fallbackAddress.ward
        };
        setSelectedAddress(mergedAddress);
      }
    }
  };

  /**
   * 从格式化地址中解析省市区信息（备用方案）
   */
  const parseAddressFromFormatted = (formattedAddress) => {
    const result = { province: '', district: '', ward: '' };

    if (formattedAddress) {
      // 越南地址通常包含这些关键词
      if (formattedAddress.includes('Hồ Chí Minh') || formattedAddress.includes('Ho Chi Minh')) {
        result.province = 'Thành phố Hồ Chí Minh';
      } else if (formattedAddress.includes('Hà Nội') || formattedAddress.includes('Hanoi')) {
        result.province = 'Hà Nội';
      } else if (formattedAddress.includes('Đà Nẵng') || formattedAddress.includes('Da Nang')) {
        result.province = 'Đà Nẵng';
      }

      // 提取区信息
      const districtMatch = formattedAddress.match(/Quận\s+(\d+|[A-Za-z\s]+)/i);
      if (districtMatch) {
        result.district = `Quận ${districtMatch[1]}`;
      }

      // 提取坊信息
      const wardMatch = formattedAddress.match(/Phường\s+([^,]+)/i);
      if (wardMatch) {
        result.ward = `Phường ${wardMatch[1]}`;
      }
    }

    return result;
  };

  /**
   * 确认选择
   */
  const handleConfirm = () => {
    if (selectedAddress.formatted_address) {
      // 格式化为旧系统兼容的格式
      const formattedData = {
        selectedProvinceName: selectedAddress.province || 'Thành phố Hồ Chí Minh',
        selectedCityName: selectedAddress.district || 'Quận 1',
        selectedWardName: selectedAddress.ward || '',
        street: selectedAddress.street || '',
        house_number: selectedAddress.house_number || '',
        formatted_address: selectedAddress.formatted_address,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude
      };

      onSelect && onSelect(formattedData);
      onClose && onClose();
    } else {
      alert('请选择一个地址');
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
            disabled={!selectedAddress.formatted_address}
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </Sheet>
  );
};

export default GoongAddressPicker;