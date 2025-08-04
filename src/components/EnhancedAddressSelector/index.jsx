import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Input, Select, Button, Toast, Sheet } from 'zmp-ui';
import axios from 'axios';
import PropTypes from 'prop-types';
import GoongMap from '../GoongMap';
import './index.scss';

// API配置
const CONFIG = {
  GOONG_API_KEY: process.env.REACT_APP_GOONG_API_KEY || '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj',
  GOONG_BASE_URL: 'https://rsapi.goong.io',
  VIETNAM_API_URL: 'https://provinces.open-api.vn/api',
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24小时缓存
  DEBOUNCE_DELAY: 300
};

/**
 * 越南地址数据静态备份
 */
const STATIC_ADDRESS_DATA = {
  provinces: [
    { code: 'hcm', name: 'Thành phố Hồ Chí Minh', type: 'city', coordinates: { lat: 10.762622, lng: 106.660172 } },
    { code: 'hn', name: 'Hà Nội', type: 'city', coordinates: { lat: 21.028511, lng: 105.804817 } },
    { code: 'dn', name: 'Đà Nẵng', type: 'city', coordinates: { lat: 16.047079, lng: 108.206230 } },
    { code: 'ct', name: 'Cần Thơ', type: 'city', coordinates: { lat: 10.045162, lng: 105.746857 } },
    { code: 'hp', name: 'Hải Phòng', type: 'city', coordinates: { lat: 20.844311, lng: 106.687797 } },
    { code: 'ag', name: 'An Giang', type: 'province', coordinates: { lat: 10.521096, lng: 105.127277 } },
    { code: 'brvt', name: 'Bà Rịa - Vũng Tàu', type: 'province', coordinates: { lat: 10.540256, lng: 107.243164 } },
    { code: 'bg', name: 'Bắc Giang', type: 'province', coordinates: { lat: 21.273167, lng: 106.196274 } },
    { code: 'bk', name: 'Bắc Kạn', type: 'province', coordinates: { lat: 22.147120, lng: 105.876275 } },
    { code: 'bl', name: 'Bạc Liêu', type: 'province', coordinates: { lat: 9.294598, lng: 105.727200 } },
    { code: 'bn', name: 'Bắc Ninh', type: 'province', coordinates: { lat: 21.186999, lng: 106.076635 } },
    { code: 'bt', name: 'Bến Tre', type: 'province', coordinates: { lat: 10.241674, lng: 106.375320 } },
    { code: 'bd', name: 'Bình Định', type: 'province', coordinates: { lat: 13.776016, lng: 109.221240 } },
    { code: 'bduong', name: 'Bình Dương', type: 'province', coordinates: { lat: 11.326398, lng: 106.778739 } },
    { code: 'bp', name: 'Bình Phước', type: 'province', coordinates: { lat: 11.749104, lng: 106.725395 } },
    { code: 'bth', name: 'Bình Thuận', type: 'province', coordinates: { lat: 11.094494, lng: 108.072663 } },
    { code: 'cm', name: 'Cà Mau', type: 'province', coordinates: { lat: 9.177357, lng: 105.152405 } },
    { code: 'cb', name: 'Cao Bằng', type: 'province', coordinates: { lat: 22.666667, lng: 106.250000 } },
    { code: 'dl', name: 'Đắk Lắk', type: 'province', coordinates: { lat: 12.710411, lng: 108.238339 } },
    { code: 'dn2', name: 'Đắk Nông', type: 'province', coordinates: { lat: 12.006595, lng: 107.609806 } }
  ],
  
  districts: {
    'hcm': [
      { code: 'q1', name: 'Quận 1', coordinates: { lat: 10.762622, lng: 106.660172 } },
      { code: 'q2', name: 'Quận 2', coordinates: { lat: 10.782217, lng: 106.728615 } },
      { code: 'q3', name: 'Quận 3', coordinates: { lat: 10.786547, lng: 106.664082 } },
      { code: 'q4', name: 'Quận 4', coordinates: { lat: 10.757780, lng: 106.704650 } },
      { code: 'q5', name: 'Quận 5', coordinates: { lat: 10.756848, lng: 106.650811 } },
      { code: 'q6', name: 'Quận 6', coordinates: { lat: 10.747598, lng: 106.634677 } },
      { code: 'q7', name: 'Quận 7', coordinates: { lat: 10.733333, lng: 106.716667 } },
      { code: 'q8', name: 'Quận 8', coordinates: { lat: 10.738739, lng: 106.677017 } },
      { code: 'q9', name: 'Quận 9', coordinates: { lat: 10.850000, lng: 106.750000 } },
      { code: 'q10', name: 'Quận 10', coordinates: { lat: 10.773333, lng: 106.666667 } },
      { code: 'q11', name: 'Quận 11', coordinates: { lat: 10.762917, lng: 106.644444 } },
      { code: 'q12', name: 'Quận 12', coordinates: { lat: 10.863333, lng: 106.655556 } },
      { code: 'tb', name: 'Quận Tân Bình', coordinates: { lat: 10.806667, lng: 106.653333 } },
      { code: 'tp', name: 'Quận Tân Phú', coordinates: { lat: 10.778333, lng: 106.627778 } },
      { code: 'bt', name: 'Quận Bình Thạnh', coordinates: { lat: 10.801944, lng: 106.704722 } },
      { code: 'pn', name: 'Quận Phú Nhuận', coordinates: { lat: 10.795556, lng: 106.681111 } },
      { code: 'go', name: 'Quận Gò Vấp', coordinates: { lat: 10.837778, lng: 106.656944 } },
      { code: 'thu', name: 'Thành phố Thủ Đức', coordinates: { lat: 10.848333, lng: 106.770833 } }
    ],
    'hn': [
      { code: 'hk', name: 'Quận Hoàn Kiếm', coordinates: { lat: 21.028511, lng: 105.804817 } },
      { code: 'bd', name: 'Quận Ba Đình', coordinates: { lat: 21.034444, lng: 105.819444 } },
      { code: 'dt', name: 'Quận Đống Đa', coordinates: { lat: 21.013889, lng: 105.826111 } },
      { code: 'hbt', name: 'Quận Hai Bà Trưng', coordinates: { lat: 21.007222, lng: 105.848889 } },
      { code: 'hm', name: 'Quận Hoàng Mai', coordinates: { lat: 20.981111, lng: 105.858889 } },
      { code: 'tx', name: 'Quận Thanh Xuân', coordinates: { lat: 20.984444, lng: 105.804444 } },
      { code: 'lbt', name: 'Quận Long Biên', coordinates: { lat: 21.054167, lng: 105.877778 } },
      { code: 'cg', name: 'Quận Cầu Giấy', coordinates: { lat: 21.033333, lng: 105.800000 } },
      { code: 'hd', name: 'Quận Hà Đông', coordinates: { lat: 20.970000, lng: 105.770000 } },
      { code: 'nb', name: 'Quận Nam Từ Liêm', coordinates: { lat: 21.013889, lng: 105.766667 } },
      { code: 'btl', name: 'Quận Bắc Từ Liêm', coordinates: { lat: 21.069444, lng: 105.766667 } },
      { code: 'th', name: 'Quận Tây Hồ', coordinates: { lat: 21.083333, lng: 105.816667 } }
    ],
    'dn': [
      { code: 'hc', name: 'Quận Hải Châu', coordinates: { lat: 16.047079, lng: 108.206230 } },
      { code: 'tk', name: 'Quận Thanh Khê', coordinates: { lat: 16.070000, lng: 108.150000 } },
      { code: 'lc', name: 'Quận Liên Chiểu', coordinates: { lat: 16.060000, lng: 108.130000 } },
      { code: 'ngu', name: 'Quận Ngũ Hành Sơn', coordinates: { lat: 16.000000, lng: 108.250000 } },
      { code: 'st', name: 'Quận Sơn Trà', coordinates: { lat: 16.100000, lng: 108.250000 } },
      { code: 'cl', name: 'Quận Cẩm Lệ', coordinates: { lat: 16.020000, lng: 108.180000 } }
    ]
  },
  
  wards: {
    'q1': [
      { code: 'bt', name: 'Phường Bến Thành', coordinates: { lat: 10.772622, lng: 106.700172 } },
      { code: 'bn', name: 'Phường Bến Nghé', coordinates: { lat: 10.768622, lng: 106.705172 } },
      { code: 'ck', name: 'Phường Cầu Kho', coordinates: { lat: 10.765622, lng: 106.695172 } },
      { code: 'co', name: 'Phường Cô Giang', coordinates: { lat: 10.759622, lng: 106.692172 } },
      { code: 'dk', name: 'Phường Đa Kao', coordinates: { lat: 10.789622, lng: 106.710172 } },
      { code: 'nc', name: 'Phường Nguyễn Cư Trinh', coordinates: { lat: 10.763622, lng: 106.687172 } },
      { code: 'nt', name: 'Phường Nguyễn Thái Bình', coordinates: { lat: 10.767622, lng: 106.684172 } },
      { code: 'pnl', name: 'Phường Phạm Ngũ Lão', coordinates: { lat: 10.756622, lng: 106.692172 } },
      { code: 'tc', name: 'Phường Tân Định', coordinates: { lat: 10.788622, lng: 106.692172 } }
    ],
    'hk': [
      { code: 'hk', name: 'Phường Hoàn Kiếm', coordinates: { lat: 21.028511, lng: 105.854817 } },
      { code: 'dt', name: 'Phường Đồng Xuân', coordinates: { lat: 21.038511, lng: 105.849817 } },
      { code: 'hb', name: 'Phường Hàng Bạc', coordinates: { lat: 21.033511, lng: 105.849817 } },
      { code: 'hbo', name: 'Phường Hàng Bồ', coordinates: { lat: 21.035511, lng: 105.847817 } },
      { code: 'hbu', name: 'Phường Hàng Buồm', coordinates: { lat: 21.036511, lng: 105.846817 } },
      { code: 'hd', name: 'Phường Hàng Đào', coordinates: { lat: 21.031511, lng: 105.851817 } },
      { code: 'hg', name: 'Phường Hàng Gai', coordinates: { lat: 21.032511, lng: 105.850817 } },
      { code: 'hm', name: 'Phường Hàng Mã', coordinates: { lat: 21.034511, lng: 105.848817 } },
      { code: 'ht', name: 'Phường Hàng Trống', coordinates: { lat: 21.029511, lng: 105.853817 } }
    ]
  }
};

/**
 * 防抖Hook
 */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * 缓存Hook
 */
const useCache = (key, defaultValue = null) => {
  const [cachedData, setCachedData] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed.expiry > Date.now()) {
          return parsed.data;
        }
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return defaultValue;
  });

  const setCacheData = useCallback((data, duration = CONFIG.CACHE_DURATION) => {
    try {
      const cacheItem = {
        data,
        expiry: Date.now() + duration
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
      setCachedData(data);
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }, [key]);

  return [cachedData, setCacheData];
};

/**
 * 增强地址选择器组件
 */
const EnhancedAddressSelector = ({
  value = {},
  onChange,
  onLocationChange,
  showMap = true,
  mapHeight = '300px',
  placeholder = {
    province: 'Chọn tỉnh/thành phố',
    district: 'Chọn quận/huyện',
    ward: 'Chọn phường/xã',
    street: 'Nhập tên đường',
    detail: 'Nhập địa chỉ chi tiết'
  },
  disabled = false,
  autoFillOnMapSelect = true,
  className = ''
}) => {
  // 状态管理
  const [provinces, setProvinces] = useState(STATIC_ADDRESS_DATA.provinces);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [streets, setStreets] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 10.762622, lng: 106.660172 });
  const [searchQuery, setSearchQuery] = useState('');
  
  // 缓存
  const [cachedProvinces, setCachedProvinces] = useCache('vietnam_provinces');
  const [cachedDistricts, setCachedDistricts] = useCache('vietnam_districts');
  const [cachedWards, setCachedWards] = useCache('vietnam_wards');
  
  // 防抖搜索
  const debouncedSearchQuery = useDebounce(searchQuery, CONFIG.DEBOUNCE_DELAY);
  
  // 引用
  const searchTimeoutRef = useRef(null);

  /**
   * 从API获取省份数据
   */
  const fetchProvincesFromAPI = useCallback(async () => {
    try {
      setLoading(true);
      
      // 尝试从越南开放API获取
      try {
        const response = await axios.get(`${CONFIG.VIETNAM_API_URL}/p/`, {
          timeout: 5000
        });
        
        if (response.data && Array.isArray(response.data)) {
          const apiProvinces = response.data.map(province => ({
            code: province.code,
            name: province.name,
            type: province.division_type,
            coordinates: province.coordinates || { lat: 0, lng: 0 }
          }));
          
          setProvinces(apiProvinces);
          setCachedProvinces(apiProvinces);
          console.log('Provinces loaded from API:', apiProvinces.length);
          return;
        }
      } catch (apiError) {
        console.warn('Vietnam API failed, using static data:', apiError.message);
      }
      
      // 如果API失败，使用静态数据
      if (cachedProvinces && cachedProvinces.length > 0) {
        setProvinces(cachedProvinces);
      } else {
        setProvinces(STATIC_ADDRESS_DATA.provinces);
        setCachedProvinces(STATIC_ADDRESS_DATA.provinces);
      }
      
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setProvinces(STATIC_ADDRESS_DATA.provinces);
    } finally {
      setLoading(false);
    }
  }, [cachedProvinces, setCachedProvinces]);

  /**
   * 获取区县数据
   */
  const fetchDistricts = useCallback(async (provinceCode) => {
    try {
      setLoading(true);
      setDistricts([]);
      setWards([]);
      
      // 首先尝试从API获取
      try {
        const response = await axios.get(`${CONFIG.VIETNAM_API_URL}/p/${provinceCode}?depth=2`, {
          timeout: 5000
        });
        
        if (response.data && response.data.districts) {
          const apiDistricts = response.data.districts.map(district => ({
            code: district.code,
            name: district.name,
            coordinates: district.coordinates || { lat: 0, lng: 0 }
          }));
          
          setDistricts(apiDistricts);
          setCachedDistricts({ ...cachedDistricts, [provinceCode]: apiDistricts });
          console.log('Districts loaded from API:', apiDistricts.length);
          return;
        }
      } catch (apiError) {
        console.warn('Districts API failed, using static data:', apiError.message);
      }
      
      // 使用静态数据
      const staticDistricts = STATIC_ADDRESS_DATA.districts[provinceCode] || [];
      setDistricts(staticDistricts);
      
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDistricts(STATIC_ADDRESS_DATA.districts[provinceCode] || []);
    } finally {
      setLoading(false);
    }
  }, [cachedDistricts, setCachedDistricts]);

  /**
   * 获取街道数据
   */
  const fetchWards = useCallback(async (districtCode) => {
    try {
      setLoading(true);
      setWards([]);
      
      // 首先尝试从API获取
      try {
        const response = await axios.get(`${CONFIG.VIETNAM_API_URL}/d/${districtCode}?depth=2`, {
          timeout: 5000
        });
        
        if (response.data && response.data.wards) {
          const apiWards = response.data.wards.map(ward => ({
            code: ward.code,
            name: ward.name,
            coordinates: ward.coordinates || { lat: 0, lng: 0 }
          }));
          
          setWards(apiWards);
          setCachedWards({ ...cachedWards, [districtCode]: apiWards });
          console.log('Wards loaded from API:', apiWards.length);
          return;
        }
      } catch (apiError) {
        console.warn('Wards API failed, using static data:', apiError.message);
      }
      
      // 使用静态数据
      const staticWards = STATIC_ADDRESS_DATA.wards[districtCode] || [];
      setWards(staticWards);
      
    } catch (error) {
      console.error('Error fetching wards:', error);
      setWards(STATIC_ADDRESS_DATA.wards[districtCode] || []);
    } finally {
      setLoading(false);
    }
  }, [cachedWards, setCachedWards]);

  /**
   * 地址搜索建议
   */
  const searchAddressSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.get(`${CONFIG.GOONG_BASE_URL}/Place/AutoComplete`, {
        params: {
          api_key: CONFIG.GOONG_API_KEY,
          input: query,
          limit: 8,
          location: `${mapCenter.lat},${mapCenter.lng}`,
          radius: 50000,
          components: 'country:vn'
        },
        timeout: 5000
      });

      if (response.data && response.data.predictions) {
        setSuggestions(response.data.predictions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [mapCenter]);

  /**
   * 反向地理编码
   */
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const response = await axios.get(`${CONFIG.GOONG_BASE_URL}/Geocode`, {
        params: {
          api_key: CONFIG.GOONG_API_KEY,
          latlng: `${lat},${lng}`
        },
        timeout: 5000
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        const addressComponents = result.address_components || [];
        
        // 解析地址组件
        const parsedAddress = {
          province: '',
          district: '',
          ward: '',
          street: '',
          detail: result.formatted_address || '',
          coordinates: { lat, lng }
        };

        addressComponents.forEach(component => {
          const types = component.types || [];
          if (types.includes('administrative_area_level_1')) {
            parsedAddress.province = component.long_name;
          } else if (types.includes('administrative_area_level_2')) {
            parsedAddress.district = component.long_name;
          } else if (types.includes('administrative_area_level_3') || types.includes('sublocality_level_1')) {
            parsedAddress.ward = component.long_name;
          } else if (types.includes('route')) {
            parsedAddress.street = component.long_name;
          }
        });

        return parsedAddress;
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
    return null;
  }, []);

  /**
   * 处理地图位置变化
   */
  const handleMapLocationChange = useCallback(async (location) => {
    setMapCenter(location);
    onLocationChange && onLocationChange(location);
    
    if (autoFillOnMapSelect) {
      const addressData = await reverseGeocode(location.lat, location.lng);
      if (addressData) {
        // 自动填充地址信息
        const newValue = {
          ...value,
          ...addressData
        };
        onChange && onChange(newValue);
        
        // 自动选择对应的省市区
        if (addressData.province) {
          const matchedProvince = provinces.find(p => 
            p.name.includes(addressData.province) || addressData.province.includes(p.name)
          );
          if (matchedProvince) {
            await fetchDistricts(matchedProvince.code);
          }
        }
      }
    }
  }, [value, onChange, onLocationChange, autoFillOnMapSelect, reverseGeocode, provinces, fetchDistricts]);

  /**
   * 处理省份选择
   */
  const handleProvinceChange = useCallback(async (provinceCode) => {
    const selectedProvince = provinces.find(p => p.code === provinceCode);
    if (selectedProvince) {
      const newValue = {
        ...value,
        province: selectedProvince.name,
        provinceCode: provinceCode,
        district: '',
        districtCode: '',
        ward: '',
        wardCode: '',
        street: ''
      };
      
      onChange && onChange(newValue);
      
      // 更新地图中心
      if (selectedProvince.coordinates) {
        setMapCenter(selectedProvince.coordinates);
      }
      
      // 加载区县数据
      await fetchDistricts(provinceCode);
    }
  }, [provinces, value, onChange, fetchDistricts]);

  /**
   * 处理区县选择
   */
  const handleDistrictChange = useCallback(async (districtCode) => {
    const selectedDistrict = districts.find(d => d.code === districtCode);
    if (selectedDistrict) {
      const newValue = {
        ...value,
        district: selectedDistrict.name,
        districtCode: districtCode,
        ward: '',
        wardCode: '',
        street: ''
      };
      
      onChange && onChange(newValue);
      
      // 更新地图中心
      if (selectedDistrict.coordinates) {
        setMapCenter(selectedDistrict.coordinates);
      }
      
      // 加载街道数据
      await fetchWards(districtCode);
    }
  }, [districts, value, onChange, fetchWards]);

  /**
   * 处理街道选择
   */
  const handleWardChange = useCallback((wardCode) => {
    const selectedWard = wards.find(w => w.code === wardCode);
    if (selectedWard) {
      const newValue = {
        ...value,
        ward: selectedWard.name,
        wardCode: wardCode
      };
      
      onChange && onChange(newValue);
      
      // 更新地图中心
      if (selectedWard.coordinates) {
        setMapCenter(selectedWard.coordinates);
      }
    }
  }, [wards, value, onChange]);

  /**
   * 处理搜索建议选择
   */
  const handleSuggestionSelect = useCallback(async (suggestion) => {
    try {
      // 获取地点详情
      const response = await axios.get(`${CONFIG.GOONG_BASE_URL}/Place/Detail`, {
        params: {
          api_key: CONFIG.GOONG_API_KEY,
          place_id: suggestion.place_id
        }
      });

      if (response.data && response.data.result) {
        const place = response.data.result;
        const coordinates = place.geometry?.location;
        
        if (coordinates) {
          const addressData = await reverseGeocode(coordinates.lat, coordinates.lng);
          if (addressData) {
            const newValue = {
              ...value,
              ...addressData,
              detail: place.formatted_address
            };
            onChange && onChange(newValue);
            setMapCenter({ lat: coordinates.lat, lng: coordinates.lng });
          }
        }
      }
      
      setShowSuggestions(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  }, [value, onChange, reverseGeocode]);

  /**
   * 初始化数据
   */
  useEffect(() => {
    fetchProvincesFromAPI();
  }, [fetchProvincesFromAPI]);

  /**
   * 搜索建议
   */
  useEffect(() => {
    if (debouncedSearchQuery) {
      searchAddressSuggestions(debouncedSearchQuery);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearchQuery, searchAddressSuggestions]);

  // 渲染省份选项
  const provinceOptions = useMemo(() => 
    provinces.map(province => ({
      value: province.code,
      title: province.name
    }))
  , [provinces]);

  // 渲染区县选项
  const districtOptions = useMemo(() => 
    districts.map(district => ({
      value: district.code,
      title: district.name
    }))
  , [districts]);

  // 渲染街道选项
  const wardOptions = useMemo(() => 
    wards.map(ward => ({
      value: ward.code,
      title: ward.name
    }))
  , [wards]);

  return (
    <div className={`enhanced-address-selector ${className}`}>
      {/* 地址搜索 */}
      <div className="address-search">
        <div className="search-input-container">
          <Input
            placeholder="Tìm kiếm địa chỉ nhanh..."
            value={searchQuery}
            onInput={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            suffix={loading && <span className="loading-icon">⏳</span>}
          />
          
          {/* 搜索建议 */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.place_id || index}
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
        </div>
      </div>

      {/* 地址选择表单 */}
      <div className="address-form">
        <div className="form-row">
          <div className="form-field">
            <label>Tỉnh/Thành phố</label>
            <Select
              placeholder={placeholder.province}
              value={value.provinceCode}
              onChange={handleProvinceChange}
              disabled={disabled || loading}
            >
              {provinceOptions.map(option => (
                <Select.Option key={option.value} value={option.value} title={option.title} />
              ))}
            </Select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Quận/Huyện</label>
            <Select
              placeholder={placeholder.district}
              value={value.districtCode}
              onChange={handleDistrictChange}
              disabled={disabled || loading || !value.provinceCode || districts.length === 0}
            >
              {districtOptions.map(option => (
                <Select.Option key={option.value} value={option.value} title={option.title} />
              ))}
            </Select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Phường/Xã</label>
            <Select
              placeholder={placeholder.ward}
              value={value.wardCode}
              onChange={handleWardChange}
              disabled={disabled || loading || !value.districtCode || wards.length === 0}
            >
              {wardOptions.map(option => (
                <Select.Option key={option.value} value={option.value} title={option.title} />
              ))}
            </Select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Tên đường</label>
            <Input
              placeholder={placeholder.street}
              value={value.street || ''}
              onInput={(e) => onChange && onChange({ ...value, street: e.target.value })}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Địa chỉ chi tiết</label>
            <Input
              placeholder={placeholder.detail}
              value={value.detail || ''}
              onInput={(e) => onChange && onChange({ ...value, detail: e.target.value })}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* 地图选择 */}
      {showMap && (
        <div className="map-section">
          <label>Chọn vị trí trên bản đồ</label>
          <GoongMap
            center={mapCenter}
            zoom={15}
            onLocationChange={handleMapLocationChange}
            showMarker={true}
            showCurrentLocationBtn={true}
            height={mapHeight}
            disabled={disabled}
          />
        </div>
      )}

      {/* 地址摘要 */}
      {(value.province || value.district || value.ward || value.street || value.detail) && (
        <div className="address-summary">
          <h4>Địa chỉ đã chọn:</h4>
          <p>
            {[value.detail, value.street, value.ward, value.district, value.province]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

// PropTypes
EnhancedAddressSelector.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
  onLocationChange: PropTypes.func,
  showMap: PropTypes.bool,
  mapHeight: PropTypes.string,
  placeholder: PropTypes.object,
  disabled: PropTypes.bool,
  autoFillOnMapSelect: PropTypes.bool,
  className: PropTypes.string
};

export default EnhancedAddressSelector;