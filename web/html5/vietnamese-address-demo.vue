<template>
  <view class="vietnamese-address-demo">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">Địa chỉ giao hàng</text>
      <text class="page-subtitle">Chọn địa chỉ giao hàng chính xác</text>
    </view>
    
    <!-- 地址搜索区域 -->
    <view class="search-section">
      <view class="search-header">
        <text class="section-title">🔍 Tìm kiếm địa chỉ</text>
      </view>
      
      <view class="search-input-container">
        <input 
          class="search-input"
          placeholder="Nhập địa chỉ để tìm kiếm..."
          v-model="searchQuery"
          @input="onSearchInput"
          :disabled="isSearching"
        />
        <view v-if="isSearching" class="search-loading">
          <text>Đang tìm...</text>
        </view>
      </view>
      
      <!-- 搜索结果 -->
      <view v-if="addressSearchResults.length > 0" class="search-results">
        <view 
          v-for="(item, index) in addressSearchResults" 
          :key="index"
          class="search-result-item"
          @click="onAddressSelect(item)"
        >
          <view class="result-main">{{ item.structured_formatting?.main_text || item.description }}</view>
          <view v-if="item.structured_formatting?.secondary_text" class="result-secondary">
            {{ item.structured_formatting.secondary_text }}
          </view>
        </view>
      </view>
    </view>
    
    <!-- 地图区域 -->
    <view class="map-section">
      <view class="map-header">
        <text class="section-title">🗺️ Chọn trên bản đồ</text>
        <text class="map-hint">Nhấn vào bản đồ để chọn vị trí chính xác</text>
      </view>
      
      <map 
        id="vietnameseMap"
        class="address-map"
        :latitude="mapCenter.lat"
        :longitude="mapCenter.lng"
        :scale="mapZoom"
        :markers="mapMarkers"
        @tap="onMapClick"
        enable-scroll
        enable-zoom
        enable-rotate
        show-location
      />
    </view>
    
    <!-- 地址表单 -->
    <view class="form-section">
      <view class="form-header">
        <text class="section-title">📝 Thông tin địa chỉ</text>
      </view>
      
      <view class="form-grid">
        <!-- 收件人信息 -->
        <view class="form-group full-width">
          <text class="form-label">Họ và tên <text class="required">*</text></text>
          <input class="form-input" v-model="formData.name" placeholder="Nhập họ và tên" />
        </view>
        
        <view class="form-group full-width">
          <text class="form-label">Số điện thoại <text class="required">*</text></text>
          <input class="form-input" v-model="formData.phone" placeholder="Nhập số điện thoại" />
        </view>
        
        <!-- 地址详情 -->
        <view class="form-group">
          <text class="form-label">Tỉnh/Thành phố <text class="required">*</text></text>
          <input class="form-input" v-model="addressFormData.province" placeholder="Chọn tỉnh/thành phố" readonly />
        </view>
        
        <view class="form-group">
          <text class="form-label">Quận/Huyện <text class="required">*</text></text>
          <input class="form-input" v-model="addressFormData.district" placeholder="Chọn quận/huyện" readonly />
        </view>
        
        <view class="form-group">
          <text class="form-label">Phường/Xã <text class="required">*</text></text>
          <input class="form-input" v-model="addressFormData.ward" placeholder="Chọn phường/xã" readonly />
        </view>
        
        <view class="form-group">
          <text class="form-label">Đường/Phố</text>
          <input class="form-input" v-model="addressFormData.street" placeholder="Tên đường/phố" />
        </view>
        
        <view class="form-group full-width">
          <text class="form-label">Số nhà</text>
          <input class="form-input" v-model="addressFormData.house_number" placeholder="Ví dụ: 123, 45A, 67/8..." />
        </view>
        
        <view class="form-group full-width">
          <text class="form-label">Địa chỉ chi tiết <text class="required">*</text></text>
          <textarea 
            class="form-textarea" 
            v-model="addressFormData.detail" 
            placeholder="Địa chỉ sẽ được điền tự động khi bạn chọn từ tìm kiếm hoặc bản đồ"
            :auto-height="true"
          />
        </view>
        
        <!-- 额外信息 -->
        <view class="form-group">
          <text class="form-label">Mã bưu điện</text>
          <input class="form-input" v-model="formData.postal_code" placeholder="Ví dụ: 10000" />
        </view>
        
        <view class="form-group">
          <text class="form-label">Email</text>
          <input class="form-input" v-model="formData.email" placeholder="example@email.com" />
        </view>
        
        <view class="form-group full-width">
          <text class="form-label">Ghi chú giao hàng</text>
          <textarea 
            class="form-textarea" 
            v-model="formData.delivery_note" 
            placeholder="Ghi chú cho người giao hàng..."
            :auto-height="true"
          />
        </view>
      </view>
    </view>
    
    <!-- 地址预览 -->
    <view v-if="selectedAddressInfo" class="preview-section">
      <view class="preview-header">
        <text class="section-title">👁️ Xem trước địa chỉ</text>
      </view>
      
      <view class="preview-content">
        <view class="preview-item">
          <text class="preview-label">Địa chỉ được chọn:</text>
          <text class="preview-value">{{ selectedAddressInfo.formatted_address }}</text>
        </view>
        
        <view v-if="selectedAddressInfo.geometry" class="preview-item">
          <text class="preview-label">Tọa độ:</text>
          <text class="preview-value">
            {{ selectedAddressInfo.geometry.location.lat }}, {{ selectedAddressInfo.geometry.location.lng }}
          </text>
        </view>
      </view>
    </view>
    
    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="btn btn-secondary" @click="clearAddressSelection">
        <text>🗑️ Xóa tất cả</text>
      </button>
      <button class="btn btn-primary" @click="saveAddress">
        <text>💾 Lưu địa chỉ</text>
      </button>
    </view>
  </view>
</template>

<script>
import { vietnameseAddressMixin } from './vietnamese-address-integration.js';

export default {
  name: 'VietnameseAddressDemo',
  mixins: [vietnameseAddressMixin],
  
  data() {
    return {
      mapId: 'vietnameseMap',
      searchQuery: '',
      searchTimeout: null,
      
      // 地图配置
      mapCenter: {
        lat: 10.8231, // Ho Chi Minh City
        lng: 106.6297
      },
      mapZoom: 12,
      mapMarkers: [],
      
      // 表单数据
      formData: {
        name: '',
        phone: '',
        postal_code: '',
        email: '',
        delivery_note: ''
      }
    };
  },
  
  methods: {
    /**
     * 搜索输入处理
     */
    onSearchInput(e) {
      const query = e.detail.value;
      this.searchQuery = query;
      
      // 防抖处理
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      this.searchTimeout = setTimeout(() => {
        this.onAddressSearch(query);
      }, 300);
    },
    
    /**
     * 地图点击处理（重写mixin方法以添加地图标记）
     */
    async onMapClick(e) {
      const { latitude, longitude } = e.detail;
      
      try {
        uni.showLoading({ title: 'Đang tìm địa chỉ...' });
        
        const addressInfo = await this.vietnameseAddress.reverseGeocode(latitude, longitude);
        
        if (addressInfo && addressInfo.vietnamese_address) {
          this.selectedAddressInfo = addressInfo;
          this.fillAddressForm(addressInfo.vietnamese_address);
          
          // 更新地图标记
          this.updateMapMarker(longitude, latitude);
          
          // 清空搜索结果
          this.addressSearchResults = [];
          this.searchQuery = addressInfo.formatted_address || '';
          
          uni.showToast({
            title: 'Đã chọn địa chỉ',
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('获取地址失败:', error);
        uni.showToast({
          title: 'Không thể lấy địa chỉ',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    /**
     * 选择地址处理（重写mixin方法）
     */
    async onAddressSelect(suggestion) {
      try {
        uni.showLoading({ title: 'Đang tải thông tin...' });
        
        const placeDetail = await this.vietnameseAddress.getPlaceDetail(suggestion.place_id);
        
        if (placeDetail && placeDetail.vietnamese_address) {
          this.selectedAddressInfo = placeDetail;
          this.fillAddressForm(placeDetail.vietnamese_address);
          
          // 更新地图位置和标记
          if (placeDetail.geometry && placeDetail.geometry.location) {
            const location = placeDetail.geometry.location;
            this.mapCenter = {
              lat: location.lat,
              lng: location.lng
            };
            this.mapZoom = 15;
            this.updateMapMarker(location.lng, location.lat);
          }
          
          // 更新搜索框并隐藏结果
          this.searchQuery = placeDetail.formatted_address || suggestion.description;
          this.addressSearchResults = [];
          
          uni.showToast({
            title: 'Đã chọn địa chỉ',
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('选择地址失败:', error);
        uni.showToast({
          title: 'Lỗi khi chọn địa chỉ',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    /**
     * 更新地图标记
     */
    updateMapMarker(lng, lat) {
      this.mapMarkers = [{
        id: 1,
        latitude: lat,
        longitude: lng,
        iconPath: '/static/images/map-marker.png',
        width: 30,
        height: 30,
        callout: {
          content: '📍 Vị trí đã chọn',
          display: 'ALWAYS',
          fontSize: 12,
          borderRadius: 4,
          bgColor: '#ffffff',
          padding: 8
        }
      }];
    },
    
    /**
     * 清空地址选择（重写mixin方法）
     */
    clearAddressSelection() {
      uni.showModal({
        title: 'Xác nhận',
        content: 'Bạn có chắc chắn muốn xóa tất cả thông tin?',
        success: (res) => {
          if (res.confirm) {
            // 调用mixin方法
            this.$options.mixins[0].methods.clearAddressSelection.call(this);
            
            // 清空表单数据
            this.formData = {
              name: '',
              phone: '',
              postal_code: '',
              email: '',
              delivery_note: ''
            };
            
            // 重置地图
            this.mapMarkers = [];
            this.mapCenter = {
              lat: 10.8231,
              lng: 106.6297
            };
            this.mapZoom = 12;
            this.searchQuery = '';
            
            uni.showToast({
              title: 'Đã xóa thông tin',
              icon: 'success'
            });
          }
        }
      });
    },
    
    /**
     * 保存地址
     */
    async saveAddress() {
      // 验证表单
      if (!this.validateForm()) {
        return;
      }
      
      try {
        uni.showLoading({ title: 'Đang lưu...' });
        
        const addressData = {
          // 收件人信息
          name: this.formData.name,
          phone: this.formData.phone,
          email: this.formData.email,
          
          // 地址信息
          country_id: 1, // 越南
          province: this.addressFormData.province,
          city: this.addressFormData.district, // 使用district作为city
          region: this.addressFormData.ward,
          street: this.addressFormData.street,
          door: this.addressFormData.house_number,
          detail: this.addressFormData.detail,
          code: this.formData.postal_code,
          
          // 坐标信息
          latitude: this.selectedAddressInfo?.geometry?.location?.lat || '',
          longitude: this.selectedAddressInfo?.geometry?.location?.lng || '',
          
          // 其他信息
          addressty: 0, // 收件人地址
          remark: this.formData.delivery_note
        };
        
        // 这里调用实际的保存API
        const response = await this.saveAddressToServer(addressData);
        
        if (response.code === 1) {
          uni.showToast({
            title: 'Lưu thành công!',
            icon: 'success'
          });
          
          // 可以返回上一页或跳转到其他页面
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          throw new Error(response.msg || 'Lưu thất bại');
        }
      } catch (error) {
        console.error('保存地址失败:', error);
        uni.showToast({
          title: error.message || 'Lỗi khi lưu địa chỉ',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    /**
     * 验证表单
     */
    validateForm() {
      // 基本信息验证
      if (!this.formData.name.trim()) {
        uni.showToast({
          title: 'Vui lòng nhập họ và tên',
          icon: 'none'
        });
        return false;
      }
      
      if (!this.formData.phone.trim()) {
        uni.showToast({
          title: 'Vui lòng nhập số điện thoại',
          icon: 'none'
        });
        return false;
      }
      
      // 地址信息验证
      if (!this.validateAddressForm()) {
        return false;
      }
      
      if (!this.addressFormData.detail.trim()) {
        uni.showToast({
          title: 'Vui lòng nhập địa chỉ chi tiết',
          icon: 'none'
        });
        return false;
      }
      
      return true;
    },
    
    /**
     * 保存地址到服务器
     */
    async saveAddressToServer(addressData) {
      return new Promise((resolve, reject) => {
        uni.request({
          url: '/api/address/add',
          method: 'POST',
          data: addressData,
          header: {
            'Content-Type': 'application/json'
          },
          success: (res) => {
            if (res.statusCode === 200) {
              resolve(res.data);
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          },
          fail: reject
        });
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.vietnamese-address-demo {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 30rpx;
  
  .page-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    display: block;
  }
  
  .page-subtitle {
    font-size: 26rpx;
    color: #666;
    margin-top: 10rpx;
    display: block;
  }
}

/* 公共样式 */
.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

/* 搜索区域 */
.search-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

.search-input-container {
  position: relative;
  margin-bottom: 20rpx;
}

.search-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  background-color: #fafafa;
}

.search-loading {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 24rpx;
}

.search-results {
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  overflow: hidden;
  background: white;
}

.search-result-item {
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background-color: #f5f5f5;
  }
}

.result-main {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.result-secondary {
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
}

/* 地图区域 */
.map-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

.map-header {
  margin-bottom: 20rpx;
}

.map-hint {
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
  display: block;
}

.address-map {
  width: 100%;
  height: 400rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

/* 表单区域 */
.form-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.form-group {
  &.full-width {
    grid-column: 1 / -1;
  }
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
  
  .required {
    color: #ff4444;
  }
}

.form-input, .form-textarea {
  width: 100%;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #fafafa;
}

.form-textarea {
  min-height: 120rpx;
  resize: none;
}

/* 预览区域 */
.preview-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

.preview-content {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
}

.preview-item {
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.preview-label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.preview-value {
  font-size: 28rpx;
  color: #333;
  display: block;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
  padding-bottom: 40rpx;
}

.btn {
  flex: 1;
  height: 88rpx;
  border-radius: 12rpx;
  border: none;
  font-size: 28rpx;
  font-weight: 500;
  
  &.btn-secondary {
    background-color: #f8f9fa;
    color: #666;
  }
  
  &.btn-primary {
    background-color: #007bff;
    color: white;
  }
  
  &:active {
    opacity: 0.8;
  }
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style> 