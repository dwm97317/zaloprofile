import React, { useState, useEffect } from 'react';
import AddressAutocomplete from '../AddressAutocomplete';
import GoogleEmbedMap from '../GoogleStaticMap';
import './index.scss';

const DynamicAddressForm = ({ onAddressChange, initialAddress = {} }) => {
  // 状态管理
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 10.762622,
    lng: 106.660172
  });
  const [addressInputValue, setAddressInputValue] = useState(initialAddress?.detail || '');

  // 处理地址选择（从自动完成）
  const handleAddressSelect = (addressData) => {
    console.log('Address selected:', addressData);

    const updatedAddress = {
      ...addressData,
      useNewAddress: useNewAddress
    };

    setSelectedAddress(updatedAddress);

    // 更新地址输入框的值
    setAddressInputValue(addressData.detail || '');

    // 如果有坐标，更新地图位置
    if (addressData.coordinates) {
      setCurrentLocation(addressData.coordinates);
    }

    if (onAddressChange) {
      onAddressChange(updatedAddress);
    }
  };

  // 处理位置选择（从地图）
  const handleLocationSelect = (locationData) => {
    console.log('Location selected:', locationData);

    setCurrentLocation(locationData.coordinates);

    // 构建完整的地址字符串
    const fullAddress = [
      locationData.street,
      locationData.ward,
      locationData.district,
      locationData.province
    ].filter(Boolean).join(', ');

    const updatedAddress = {
      ...selectedAddress,
      ...locationData,
      detail: fullAddress, // 设置完整地址
      useNewAddress: useNewAddress
    };

    setSelectedAddress(updatedAddress);

    // 更新地址输入框的值
    setAddressInputValue(fullAddress);

    if (onAddressChange) {
      onAddressChange(updatedAddress);
    }
  };

  // 处理地址模式切换
  const handleAddressModeChange = (newMode) => {
    setUseNewAddress(newMode);

    const updatedAddress = {
      ...selectedAddress,
      useNewAddress: newMode
    };

    setSelectedAddress(updatedAddress);

    if (onAddressChange) {
      onAddressChange(updatedAddress);
    }
  };

  return (
    <div className="dynamic-address-form">
      {/* 使用新地址开关 */}
      <div className="address-toggle">
        <div className="toggle-switch">
          <input
            type="checkbox"
            id="useNewAddress"
            checked={useNewAddress}
            onChange={(e) => handleAddressModeChange(e.target.checked)}
          />
          <label htmlFor="useNewAddress" className="toggle-label">
            <span className="toggle-slider"></span>
          </label>
        </div>
        <span className="toggle-text">Sử dụng địa danh mới</span>
      </div>

      {/* 地址自动完成输入 */}
      <div className="address-input-section">
        <AddressAutocomplete
          onAddressSelect={handleAddressSelect}
          placeholder="Địa chỉ chi tiết*"
          initialValue={addressInputValue}
          key={addressInputValue} // 强制重新渲染以更新输入值
          className="main-address-input"
        />
      </div>

      {/* 地址组件显示区域 */}
      <div className="address-details">
        <div className="address-info">
          <div className="info-item">
            <span className="label">Tỉnh/Thành phố:</span>
            <span className="value">
              {selectedAddress?.province || 'Chưa xác định'}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Quận/Huyện:</span>
            <span className="value">
              {selectedAddress?.district || 'Chưa xác định'}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Phường/Xã:</span>
            <span className="value">
              {selectedAddress?.ward || 'Chưa xác định'}
            </span>
          </div>
        </div>

        {/* 地址模式指示器 */}
        <div className="address-mode-indicator">
          <span className={`mode-badge ${useNewAddress ? 'new-mode' : 'old-mode'}`}>
            {useNewAddress ? 'Địa danh mới' : 'Địa danh cũ'}
          </span>
        </div>
      </div>

      {/* 地图选择器 */}
      <div className="map-section">
        <GoogleEmbedMap
          onLocationSelect={handleLocationSelect}
          initialLocation={currentLocation}
          height={250}
        />
      </div>
    </div>
  );
};

export default DynamicAddressForm;
