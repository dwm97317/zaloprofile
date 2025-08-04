import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { parseAddressData } from '../../utils/addressParser';
import './index.scss';

const AddressAutocomplete = ({ 
  onAddressSelect, 
  placeholder = "Nhập địa chỉ...", 
  initialValue = "",
  className = "" 
}) => {
  // API配置 - 使用经过测试的正确API密钥
  const GOONG_API_KEY = '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj';
  const FALLBACK_API_KEY = '7nGVvNpejuF0maLfRDz5T1tWxubVwTzLpSlTBNHI';
  const GOONG_BASE_URL = 'https://rsapi.goong.io';

  const [inputValue, setInputValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debounceTimer = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // 越南地址解析辅助函数
  const extractProvinceFromInput = (input) => {
    const provincePatterns = [
      /Thành phố ([^,]+)/i,
      /Tỉnh ([^,]+)/i,
      /(Hồ Chí Minh|Hà Nội|Đà Nẵng|Hải Phòng|Cần Thơ)/i
    ];

    for (const pattern of provincePatterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    return '';
  };

  const extractDistrictFromInput = (input) => {
    const districtPatterns = [
      /Quận ([^,]+)/i,
      /Huyện ([^,]+)/i,
      /Thành phố ([^,]+)/i,
      /Thị xã ([^,]+)/i
    ];

    for (const pattern of districtPatterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return '';
  };

  const extractWardFromInput = (input) => {
    const wardPatterns = [
      /Phường ([^,]+)/i,
      /Xã ([^,]+)/i,
      /Thị trấn ([^,]+)/i
    ];

    for (const pattern of wardPatterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return '';
  };

  const extractStreetFromInput = (input) => {
    const streetPatterns = [
      /(\d+\s+)?Đường ([^,]+)/i,
      /(\d+\s+)?Phố ([^,]+)/i,
      /(\d+\s+)([^,]+)/i
    ];

    for (const pattern of streetPatterns) {
      const match = input.match(pattern);
      if (match) {
        return match[2] || match[4] || match[0];
      }
    }
    return '';
  };

  // 监听外部值变化
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  // 搜索地址建议
  const searchAddresses = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${GOONG_BASE_URL}/Place/AutoComplete`, {
        params: {
          api_key: GOONG_API_KEY,
          input: query,
          location: '10.762622,106.660172',
          radius: 50000,
          language: 'vi'
        }
      });

      if (response.data && response.data.predictions) {
        setSuggestions(response.data.predictions.slice(0, 8));
        setShowSuggestions(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取地址详细信息
  const getAddressDetails = async (placeId) => {
    try {
      const response = await axios.get(`${GOONG_BASE_URL}/Place/Detail`, {
        params: {
          api_key: GOONG_API_KEY,
          place_id: placeId
        }
      });

      if (response.data && response.data.result) {
        return response.data.result;
      }
    } catch (error) {
      console.error('Get address details error:', error);
    }
    return null;
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // 防抖搜索
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchAddresses(value);
    }, 300);

    // 处理用户直接输入的地址（不选择建议）
    // 这对于越南用户很重要，他们可能直接输入完整地址
    if (value.trim().length > 10 && onAddressSelect) {
      // 延迟处理，给用户时间完成输入
      setTimeout(() => {
        if (inputValue === value && !showSuggestions) {
          // 用户没有选择建议，直接使用输入的地址
          onAddressSelect({
            detail: value,
            description: value,
            formatted_address: value,
            // 尝试从输入中解析地址组件
            province: extractProvinceFromInput(value),
            district: extractDistrictFromInput(value),
            ward: extractWardFromInput(value),
            street: extractStreetFromInput(value),
            is_manual_input: true
          });
        }
      }, 1000);
    }
  };

  // 处理地址选择
  const handleAddressSelect = async (suggestion, index) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // 获取详细信息
    const details = await getAddressDetails(suggestion.place_id);

    // 解析地址信息
    const parsedAddress = parseAddressData(details);

    if (onAddressSelect) {
      onAddressSelect({
        ...parsedAddress,
        detail: suggestion.description,
        raw_suggestion: suggestion,
        raw_details: details
      });
    }
  };

  // 键盘导航
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleAddressSelect(suggestions[selectedIndex], selectedIndex);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // 滚动到选中项
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={`address-autocomplete ${className}`}>
      <div className="input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="address-input"
        />
        
        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="suggestions-container">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id || index}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleAddressSelect(suggestion, index)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="suggestion-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="suggestion-content">
                <div className="main-text">
                  {suggestion.structured_formatting?.main_text || suggestion.description}
                </div>
                {suggestion.structured_formatting?.secondary_text && (
                  <div className="secondary-text">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
