/**
 * 越南地址格式化工具类
 * 根据越南人的文化特色和使用习惯优化地址处理
 */

/**
 * 越南地址组件类型定义
 */
const AddressComponents = {
  HOUSE_NUMBER: 'houseNumber',    // 门牌号
  STREET: 'street',               // 街道
  WARD: 'ward',                   // 坊/社 (Phường/Xã)
  DISTRICT: 'district',           // 区/县 (Quận/Huyện)
  PROVINCE: 'province',           // 省/市 (Tỉnh/Thành phố)
  COUNTRY: 'country'              // 国家
};

/**
 * 越南常见地址术语和缩写
 */
const VietnameseAddressTerms = {
  // 行政区划术语
  province: ['Tỉnh', 'Thành phố', 'TP'],
  district: ['Quận', 'Huyện', 'Thành phố', 'Thị xã', 'TP', 'TX'],
  ward: ['Phường', 'Xã', 'Thị trấn', 'P', 'X', 'TT'],
  street: ['Đường', 'Phố', 'Ngõ', 'Hẻm', 'Đ', 'P'],
  
  // 常见缩写展开
  abbreviations: {
    'TP': 'Thành phố',
    'TX': 'Thị xã',
    'P': 'Phường',
    'X': 'Xã',
    'TT': 'Thị trấn',
    'Đ': 'Đường',
    'Q': 'Quận',
    'H': 'Huyện'
  }
};

/**
 * 格式化越南地址为标准格式
 * 按越南人习惯：门牌号 + 街道 + 坊 + 区 + 省
 * @param {Object} addressData 地址数据对象
 * @returns {string} 格式化后的地址字符串
 */
export const formatVietnameseAddress = (addressData) => {
  if (!addressData) return '';
  
  const parts = [];
  
  // 按越南习惯的顺序组装地址
  if (addressData.houseNumber || addressData.door) {
    parts.push(addressData.houseNumber || addressData.door);
  }
  
  if (addressData.street) {
    // 确保街道名包含适当的前缀
    const street = addressData.street;
    if (!street.match(/^(Đường|Phố|Ngõ|Hẻm)/)) {
      parts.push(`Đường ${street}`);
    } else {
      parts.push(street);
    }
  }
  
  if (addressData.ward || addressData.region) {
    const ward = addressData.ward || addressData.region;
    if (!ward.match(/^(Phường|Xã|Thị trấn)/)) {
      // 智能判断是城市区域还是农村区域
      const prefix = ward.includes('Phường') || addressData.district?.includes('Quận') ? 'Phường' : 'Xã';
      parts.push(`${prefix} ${ward}`);
    } else {
      parts.push(ward);
    }
  }
  
  if (addressData.district || addressData.city) {
    const district = addressData.district || addressData.city;
    if (!district.match(/^(Quận|Huyện|Thành phố|Thị xã)/)) {
      // 智能判断区域类型
      const prefix = district.includes('Quận') || addressData.province?.includes('Thành phố') ? 'Quận' : 'Huyện';
      parts.push(`${prefix} ${district}`);
    } else {
      parts.push(district);
    }
  }
  
  if (addressData.province) {
    const province = addressData.province;
    if (!province.match(/^(Tỉnh|Thành phố)/)) {
      // 主要城市使用"Thành phố"，其他使用"Tỉnh"
      const majorCities = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
      const prefix = majorCities.some(city => province.includes(city)) ? 'Thành phố' : 'Tỉnh';
      parts.push(`${prefix} ${province}`);
    } else {
      parts.push(province);
    }
  }
  
  // 过滤空值和重复项，然后用逗号连接
  const filteredParts = parts.filter(Boolean);

  // 去除重复的地址组件
  const uniqueParts = [];
  for (const part of filteredParts) {
    // 检查是否已存在相同或相似的部分
    const isDuplicate = uniqueParts.some(existingPart => {
      // 完全相同
      if (existingPart === part) return true;

      // 去除前缀后相同 (例如: "Tỉnh Quảng Ninh" 和 "Quảng Ninh")
      const cleanExisting = existingPart.replace(/^(Tỉnh|Thành phố|Quận|Huyện|Phường|Xã|Thị trấn|Đường|Phố)\s+/, '');
      const cleanCurrent = part.replace(/^(Tỉnh|Thành phố|Quận|Huyện|Phường|Xã|Thị trấn|Đường|Phố)\s+/, '');

      return cleanExisting === cleanCurrent;
    });

    if (!isDuplicate) {
      uniqueParts.push(part);
    }
  }

  return uniqueParts.join(', ');
};

/**
 * 解析完整的越南地址字符串
 * @param {string} fullAddress 完整地址字符串
 * @returns {Object} 解析后的地址组件
 */
export const parseVietnameseAddress = (fullAddress) => {
  if (!fullAddress || typeof fullAddress !== 'string') {
    return {};
  }
  
  const result = {};
  const parts = fullAddress.split(',').map(part => part.trim());
  
  // 从后往前解析（省 -> 区 -> 坊 -> 街道 -> 门牌号）
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    
    // 识别省/直辖市
    if (part.match(/^(Tỉnh|Thành phố)/)) {
      result.province = part;
    }
    // 识别区/县
    else if (part.match(/^(Quận|Huyện|Thành phố|Thị xã)/)) {
      result.district = part;
    }
    // 识别坊/社
    else if (part.match(/^(Phường|Xã|Thị trấn)/)) {
      result.ward = part;
    }
    // 识别街道
    else if (part.match(/^(Đường|Phố|Ngõ|Hẻm)/) || part.match(/\d+\s+/)) {
      if (part.match(/^\d+/)) {
        // 包含门牌号的街道
        const match = part.match(/^(\d+)\s+(.+)/);
        if (match) {
          result.houseNumber = match[1];
          result.street = match[2];
        }
      } else {
        result.street = part;
      }
    }
    // 纯数字可能是门牌号
    else if (part.match(/^\d+[A-Za-z]?$/)) {
      result.houseNumber = part;
    }
    // 其他情况作为街道处理
    else if (!result.street && i === 0) {
      result.street = part;
    }
  }
  
  return result;
};

/**
 * 验证越南地址格式
 * @param {string} address 地址字符串
 * @returns {Object} 验证结果
 */
export const validateVietnameseAddress = (address) => {
  const result = {
    isValid: false,
    errors: [],
    suggestions: []
  };
  
  if (!address || address.trim().length === 0) {
    result.errors.push('Địa chỉ không được để trống');
    return result;
  }
  
  const parsed = parseVietnameseAddress(address);
  
  // 检查必要组件
  if (!parsed.province) {
    result.errors.push('Thiếu thông tin tỉnh/thành phố');
    result.suggestions.push('Vui lòng thêm tên tỉnh/thành phố (ví dụ: Tỉnh Hồ Chí Minh)');
  }
  
  if (!parsed.district) {
    result.errors.push('Thiếu thông tin quận/huyện');
    result.suggestions.push('Vui lòng thêm tên quận/huyện (ví dụ: Quận 1)');
  }
  
  if (!parsed.street && !parsed.ward) {
    result.errors.push('Thiếu thông tin đường/phường');
    result.suggestions.push('Vui lòng thêm tên đường hoặc phường');
  }
  
  result.isValid = result.errors.length === 0;
  return result;
};

/**
 * 为越南用户提供地址输入建议
 * @param {string} input 用户输入
 * @returns {Array} 建议列表
 */
export const getAddressSuggestions = (input) => {
  const suggestions = [];
  
  if (!input || input.length < 2) {
    return [
      'Ví dụ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh',
      'Ví dụ: 45 Hàng Bài, Phường Hàng Bài, Quận Hoàn Kiếm, Thành phố Hà Nội'
    ];
  }
  
  // 这里可以添加更多智能建议逻辑
  return suggestions;
};

/**
 * 展开越南地址中的常见缩写
 * @param {string} address 包含缩写的地址
 * @returns {string} 展开后的地址
 */
export const expandVietnameseAbbreviations = (address) => {
  if (!address) return '';
  
  let expanded = address;
  
  // 展开常见缩写
  Object.entries(VietnameseAddressTerms.abbreviations).forEach(([abbr, full]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'g');
    expanded = expanded.replace(regex, full);
  });
  
  return expanded;
};

/**
 * 检查地址是否为越南主要城市
 * @param {string} address 地址字符串
 * @returns {boolean} 是否为主要城市
 */
export const isMajorVietnameseCity = (address) => {
  const majorCities = [
    'Hồ Chí Minh', 'Sài Gòn', 'TPHCM',
    'Hà Nội', 'Hanoi',
    'Đà Nẵng', 'Da Nang',
    'Hải Phòng', 'Hai Phong',
    'Cần Thơ', 'Can Tho'
  ];
  
  return majorCities.some(city => 
    address.toLowerCase().includes(city.toLowerCase())
  );
};

export default {
  formatVietnameseAddress,
  parseVietnameseAddress,
  validateVietnameseAddress,
  getAddressSuggestions,
  expandVietnameseAbbreviations,
  isMajorVietnameseCity,
  AddressComponents,
  VietnameseAddressTerms
};
