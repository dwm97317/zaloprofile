/**
 * 地址解析工具
 * 用于从Goong API返回的地址数据中提取行政区划信息
 */

/**
 * 从地址组件中提取行政区划信息
 * @param {Array} addressComponents - Goong API返回的地址组件数组
 * @returns {Object} 包含省市、区县、街道信息的对象
 */
export const parseAddressComponents = (addressComponents) => {
  if (!addressComponents || !Array.isArray(addressComponents)) {
    return {
      province: '',
      district: '',
      ward: '',
      street: ''
    };
  }

  let province = '';
  let district = '';
  let ward = '';
  let street = '';

  addressComponents.forEach((component, index) => {
    const name = component.long_name || component.short_name;

    if (!name) return;

    // Goong API 返回的地址组件没有 types 字段，需要根据位置和名称模式来识别
    // 通常顺序是：具体地点 -> 街道 -> 区/县 -> 市 -> 省

    if (index === 0) {
      // 第一个通常是具体地点名称
      if (!street) {
        street = name;
      }
    } else if (index === 1) {
      // 第二个通常是街道名称
      if (!street || street === name) {
        street = name;
      }
    } else if (index === 2) {
      // 第三个通常是区/县级别
      if (name.includes('Phường') || name.includes('Xã') || name.includes('Thị trấn')) {
        ward = name;
      } else if (name.includes('Quận') || name.includes('Huyện') || name.includes('Thành phố') || name.includes('Thị xã')) {
        district = name;
      } else {
        // 如果没有明确标识，根据位置推断
        ward = name;
      }
    } else if (index === 3) {
      // 第四个通常是市级别
      if (name.includes('Quận') || name.includes('Huyện') || name.includes('Thành phố') || name.includes('Thị xã')) {
        district = name;
      } else {
        // 可能是市级行政区
        if (!district) {
          district = name;
        }
      }
    } else if (index === 4) {
      // 第五个通常是省级别
      province = name;
    }

    // 额外的智能识别
    if (name.includes('Thành phố Hồ Chí Minh') || name.includes('Hồ Chí Minh') || name.includes('TP.HCM') || name.includes('TPHCM')) {
      province = 'Thành phố Hồ Chí Minh';
    } else if (name.includes('Hà Nội')) {
      province = 'Hà Nội';
    } else if (name.includes('Đà Nẵng')) {
      province = 'Đà Nẵng';
    } else if (name.includes('Cần Thơ')) {
      province = 'Cần Thơ';
    }
  });

  return {
    province,
    district,
    ward,
    street
  };
};

/**
 * 从格式化地址字符串中提取行政区划信息（备用方法）
 * @param {string} formattedAddress - 格式化的地址字符串
 * @returns {Object} 包含省市、区县、街道信息的对象
 */
export const parseFormattedAddress = (formattedAddress) => {
  if (!formattedAddress || typeof formattedAddress !== 'string') {
    return {
      province: '',
      district: '',
      ward: '',
      street: ''
    };
  }

  // 越南地址格式通常为：街道, 区/县, 省/市
  const parts = formattedAddress.split(',').map(part => part.trim());

  let province = '';
  let district = '';
  let ward = '';
  let street = '';

  // 遍历所有部分进行识别
  parts.forEach((part, index) => {
    // 检查是否是省/市
    if (part.includes('Thành phố') || part.includes('Tỉnh') ||
        part === 'Hà Nội' || part === 'Đà Nẵng' || part === 'Cần Thơ' ||
        part.includes('Thành phố Hồ Chí Minh') || part.includes('Hồ Chí Minh')) {
      province = part;
    }
    // 检查是否是区/县
    else if (part.includes('Quận') || part.includes('Huyện') ||
             part.includes('Thành phố') || part.includes('Thị xã')) {
      district = part;
    }
    // 检查是否是街道/乡
    else if (part.includes('Phường') || part.includes('Xã') ||
             part.includes('Thị trấn')) {
      ward = part;
    }
    // 其他可能是街道地址
    else if (!street && index < parts.length - 2) {
      street = part;
    }
  });

  return {
    province,
    district,
    ward,
    street
  };
};

/**
 * 智能地址解析 - 综合多种策略
 * @param {Object} addressData - 包含地址详细信息的对象
 * @returns {Object} 解析后的地址信息
 */
export const parseAddressData = (addressData) => {
  let result = {
    province: '',
    district: '',
    ward: '',
    street: '',
    coordinates: null,
    formatted_address: ''
  };

  if (!addressData) {
    return result;
  }

  // 策略1: 从地址组件解析
  if (addressData.address_components) {
    const componentResult = parseAddressComponents(addressData.address_components);
    result = { ...result, ...componentResult };
  }

  // 策略2: 从格式化地址解析（补充缺失信息）
  const formattedAddress = addressData.formatted_address || addressData.description || '';
  if (formattedAddress && (!result.province || !result.district)) {
    const formattedResult = parseFormattedAddress(formattedAddress);

    // 只填充缺失的字段
    if (!result.province) result.province = formattedResult.province;
    if (!result.district) result.district = formattedResult.district;
    if (!result.ward) result.ward = formattedResult.ward;
    if (!result.street) result.street = formattedResult.street;
  }

  // 策略3: 智能识别特殊地名
  if (!result.province && formattedAddress) {
    if (formattedAddress.includes('Hồ Chí Minh') || formattedAddress.includes('TP.HCM') || formattedAddress.includes('TPHCM')) {
      result.province = 'Thành phố Hồ Chí Minh';
    } else if (formattedAddress.includes('Hà Nội')) {
      result.province = 'Hà Nội';
    } else if (formattedAddress.includes('Đà Nẵng')) {
      result.province = 'Đà Nẵng';
    } else if (formattedAddress.includes('Cần Thơ')) {
      result.province = 'Cần Thơ';
    }
  }

  // 设置坐标
  if (addressData.geometry && addressData.geometry.location) {
    result.coordinates = {
      lat: addressData.geometry.location.lat,
      lng: addressData.geometry.location.lng
    };
  }

  // 设置格式化地址
  result.formatted_address = formattedAddress;

  return result;
};

/**
 * 反向地理编码解析
 * @param {number} lat - 纬度
 * @param {number} lng - 经度
 * @returns {Promise<Object>} 解析后的地址信息
 */
export const reverseGeocode = async (lat, lng) => {
  // 使用经过测试的正确API密钥
  const GOONG_API_KEY = '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj';
  const FALLBACK_API_KEY = '7nGVvNpejuF0maLfRDz5T1tWxubVwTzLpSlTBNHI';
  const GOONG_BASE_URL = 'https://rsapi.goong.io';

  try {
    const response = await fetch(`${GOONG_BASE_URL}/Geocode?` + new URLSearchParams({
      api_key: GOONG_API_KEY,
      latlng: `${lat},${lng}`
    }));

    const data = await response.json();

    if (data && data.results && data.results.length > 0) {
      return parseAddressData(data.results[0]);
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
  }

  return {
    province: '',
    district: '',
    ward: '',
    street: '',
    coordinates: { lat, lng },
    formatted_address: ''
  };
};
