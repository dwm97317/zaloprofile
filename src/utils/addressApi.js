import request from './request';

/**
 * 越南地址API工具类
 * 基于Goong API服务
 */
class AddressApi {
  
  /**
   * 地址自动补全搜索
   * @param {string} input 搜索关键词
   * @param {object} options 选项
   * @returns {Promise}
   */
  static async autocomplete(input, options = {}) {
    try {
      const params = {
        input,
        limit: options.limit || 10,
        ...options
      };
      
      const response = await request.get('goong_address/autocomplete', params);
      return response;
    } catch (error) {
      console.error('地址自动补全失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取地点详情
   * @param {string} placeId 地点ID
   * @returns {Promise}
   */
  static async getPlaceDetail(placeId) {
    try {
      const response = await request.get('goong_address/place_detail', {
        place_id: placeId
      });
      return response;
    } catch (error) {
      console.error('获取地点详情失败:', error);
      throw error;
    }
  }
  
  /**
   * 反向地理编码 - 根据坐标获取地址
   * @param {number} lat 纬度
   * @param {number} lng 经度
   * @returns {Promise}
   */
  static async reverseGeocode(lat, lng) {
    try {
      const response = await request.get('goong_address/reverse_geocode', {
        lat,
        lng
      });
      return response;
    } catch (error) {
      console.error('反向地理编码失败:', error);
      throw error;
    }
  }
  
  /**
   * 地理编码 - 根据地址获取坐标
   * @param {string} address 地址
   * @returns {Promise}
   */
  static async geocode(address) {
    try {
      const response = await request.get('goong_address/geocode', {
        address
      });
      return response;
    } catch (error) {
      console.error('地理编码失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取越南省份列表
   * @returns {Promise}
   */
  static async getProvinces() {
    try {
      const response = await request.get('goong_address/get_provinces');
      return response;
    } catch (error) {
      console.error('获取省份列表失败:', error);
      throw error;
    }
  }
  
  /**
   * 验证地址格式
   * @param {object} addressData 地址数据
   * @returns {Promise}
   */
  static async validateAddress(addressData) {
    try {
      const response = await request.post('goong_address/validate_address', addressData);
      return response;
    } catch (error) {
      console.error('地址验证失败:', error);
      throw error;
    }
  }
  
  /**
   * 格式化越南地址为标准格式
   * @param {object} addressData 地址数据
   * @returns {string}
   */
  static formatVietnameseAddress(addressData) {
    const parts = [];
    
    // 按照越南地址格式排列
    if (addressData.house_number) parts.push(addressData.house_number);
    if (addressData.street) parts.push(addressData.street);
    if (addressData.ward) parts.push(addressData.ward);
    if (addressData.district) parts.push(addressData.district);
    if (addressData.province) parts.push(addressData.province);
    
    return parts.join(', ');
  }
  
  /**
   * 解析Goong API返回的地址组件
   * @param {array} addressComponents 地址组件数组
   * @returns {object}
   */
  static parseAddressComponents(addressComponents) {
    const result = {
      province: '',
      district: '',
      ward: '',
      street: '',
      house_number: ''
    };
    
    if (!Array.isArray(addressComponents)) {
      return result;
    }
    
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
  }
  
  /**
   * 获取用户当前位置的地址
   * @param {object} options 选项
   * @returns {Promise}
   */
  static async getCurrentLocationAddress(options = {}) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持地理定位'));
        return;
      }
      
      const geolocationOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
        ...options
      };
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const result = await this.reverseGeocode(latitude, longitude);
            resolve({
              position: { latitude, longitude },
              address: result
            });
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(error);
        },
        geolocationOptions
      );
    });
  }
}

export default AddressApi;