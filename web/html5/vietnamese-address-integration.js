/**
 * 越南地址集成脚本
 * 用于在现有的zalo小程序页面中快速集成越南地址功能
 */

// UniApp环境适配
const isUniApp = typeof uni !== 'undefined';

/**
 * UniApp版本的越南地址组件
 */
class UniAppVietnameseAddress {
    constructor(options = {}) {
        this.options = {
            apiKey: '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj',
            apiBaseUrl: '/api/goong-address',
            mapId: 'vietnameseMap',
            debug: true,
            ...options
        };
        
        this.selectedAddress = null;
        this.init();
    }
    
    init() {
        if (isUniApp) {
            this.initUniApp();
        } else {
            console.warn('非UniApp环境，请使用VietnameseAddressComponent');
        }
    }
    
    /**
     * UniApp环境初始化
     */
    initUniApp() {
        // 创建地图上下文
        this.mapContext = uni.createMapContext(this.options.mapId);
        
        // 监听地址选择事件
        this.bindUniAppEvents();
    }
    
    /**
     * 绑定UniApp事件
     */
    bindUniAppEvents() {
        // 地图点击事件需要在页面的onReady中设置
        console.log('Vietnamese Address Component for UniApp initialized');
    }
    
    /**
     * 地址搜索 - UniApp版本
     */
    async searchAddress(query, userLocation = null) {
        if (!query || query.length < 2) {
            return { suggestions: [] };
        }
        
        try {
            const params = {
                input: query,
                limit: 10
            };
            
            if (userLocation) {
                params.lat = userLocation.lat;
                params.lng = userLocation.lng;
            }
            
            const response = await this.uniRequest({
                url: `${this.options.apiBaseUrl}/autocomplete`,
                method: 'GET',
                data: params
            });
            
            if (response.code === 1) {
                return response.data;
            } else {
                throw new Error(response.msg || '搜索失败');
            }
        } catch (error) {
            console.error('地址搜索失败:', error);
            uni.showToast({
                title: '搜索失败，请重试',
                icon: 'none'
            });
            return { suggestions: [] };
        }
    }
    
    /**
     * 获取地点详情 - UniApp版本
     */
    async getPlaceDetail(placeId) {
        try {
            const response = await this.uniRequest({
                url: `${this.options.apiBaseUrl}/place-detail`,
                method: 'GET',
                data: { place_id: placeId }
            });
            
            if (response.code === 1) {
                this.selectedAddress = response.data.place;
                return response.data.place;
            } else {
                throw new Error(response.msg || '获取详情失败');
            }
        } catch (error) {
            console.error('获取地点详情失败:', error);
            uni.showToast({
                title: '获取详情失败',
                icon: 'none'
            });
            return null;
        }
    }
    
    /**
     * 反向地理编码 - UniApp版本
     */
    async reverseGeocode(lat, lng) {
        try {
            const response = await this.uniRequest({
                url: `${this.options.apiBaseUrl}/reverse-geocode`,
                method: 'GET',
                data: { lat, lng }
            });
            
            if (response.code === 1) {
                this.selectedAddress = response.data.address;
                return response.data.address;
            } else {
                throw new Error(response.msg || '地理编码失败');
            }
        } catch (error) {
            console.error('反向地理编码失败:', error);
            uni.showToast({
                title: '定位失败，请重试',
                icon: 'none'
            });
            return null;
        }
    }
    
    /**
     * 更新地图位置
     */
    updateMapLocation(lng, lat, zoom = 15) {
        if (this.mapContext) {
            this.mapContext.moveToLocation({
                latitude: lat,
                longitude: lng
            });
            
            // 添加标记
            this.mapContext.addMarkers({
                markers: [{
                    id: 1,
                    latitude: lat,
                    longitude: lng,
                    iconPath: '/static/images/map-marker.png',
                    width: 30,
                    height: 30
                }]
            });
        }
    }
    
    /**
     * 格式化越南地址用于显示
     */
    formatVietnameseAddress(vietnameseAddress) {
        if (!vietnameseAddress) return '';
        
        const parts = [];
        
        if (vietnameseAddress.house_number) parts.push(vietnameseAddress.house_number);
        if (vietnameseAddress.street) parts.push(vietnameseAddress.street);
        if (vietnameseAddress.ward) parts.push(vietnameseAddress.ward);
        if (vietnameseAddress.district) parts.push(vietnameseAddress.district);
        if (vietnameseAddress.province) parts.push(vietnameseAddress.province);
        
        return parts.join(', ');
    }
    
    /**
     * UniApp请求封装
     */
    async uniRequest(options) {
        return new Promise((resolve, reject) => {
            uni.request({
                ...options,
                header: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.header
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
    
    /**
     * 获取选择的地址
     */
    getSelectedAddress() {
        return this.selectedAddress;
    }
    
    /**
     * 清空选择的地址
     */
    clearSelectedAddress() {
        this.selectedAddress = null;
    }
}

/**
 * 越南地址选择页面mixin
 * 可以在需要地址选择的页面中混入使用
 */
const vietnameseAddressMixin = {
    data() {
        return {
            vietnameseAddress: null,
            addressSearchResults: [],
            isSearching: false,
            selectedAddressInfo: null,
            addressFormData: {
                province: '',
                district: '',
                ward: '',
                street: '',
                house_number: '',
                detail: ''
            }
        };
    },
    
    onReady() {
        this.initVietnameseAddress();
    },
    
    methods: {
        /**
         * 初始化越南地址组件
         */
        initVietnameseAddress() {
            this.vietnameseAddress = new UniAppVietnameseAddress({
                mapId: this.mapId || 'vietnameseMap'
            });
        },
        
        /**
         * 地址搜索
         */
        async onAddressSearch(query) {
            if (!query || query.length < 2) {
                this.addressSearchResults = [];
                return;
            }
            
            this.isSearching = true;
            
            try {
                const result = await this.vietnameseAddress.searchAddress(query);
                this.addressSearchResults = result.suggestions || [];
            } catch (error) {
                console.error('搜索失败:', error);
                this.addressSearchResults = [];
            } finally {
                this.isSearching = false;
            }
        },
        
        /**
         * 选择地址
         */
        async onAddressSelect(suggestion) {
            try {
                const placeDetail = await this.vietnameseAddress.getPlaceDetail(suggestion.place_id);
                
                if (placeDetail && placeDetail.vietnamese_address) {
                    this.selectedAddressInfo = placeDetail;
                    this.fillAddressForm(placeDetail.vietnamese_address);
                    
                    // 更新地图位置
                    if (placeDetail.geometry && placeDetail.geometry.location) {
                        const location = placeDetail.geometry.location;
                        this.vietnameseAddress.updateMapLocation(location.lng, location.lat);
                    }
                    
                    // 触发地址选择事件
                    this.$emit('address-selected', placeDetail);
                }
            } catch (error) {
                console.error('选择地址失败:', error);
            }
        },
        
        /**
         * 地图点击事件
         */
        async onMapClick(e) {
            const { latitude, longitude } = e.detail;
            
            try {
                const addressInfo = await this.vietnameseAddress.reverseGeocode(latitude, longitude);
                
                if (addressInfo && addressInfo.vietnamese_address) {
                    this.selectedAddressInfo = addressInfo;
                    this.fillAddressForm(addressInfo.vietnamese_address);
                    
                    // 更新地图标记
                    this.vietnameseAddress.updateMapLocation(longitude, latitude);
                    
                    // 触发地址选择事件
                    this.$emit('address-selected', addressInfo);
                }
            } catch (error) {
                console.error('获取地址失败:', error);
            }
        },
        
        /**
         * 填充地址表单
         */
        fillAddressForm(vietnameseAddress) {
            this.addressFormData = {
                province: vietnameseAddress.province || '',
                district: vietnameseAddress.district || '',
                ward: vietnameseAddress.ward || '',
                street: vietnameseAddress.street || '',
                house_number: vietnameseAddress.house_number || '',
                detail: this.vietnameseAddress.formatVietnameseAddress(vietnameseAddress)
            };
        },
        
        /**
         * 清空地址选择
         */
        clearAddressSelection() {
            this.selectedAddressInfo = null;
            this.addressSearchResults = [];
            this.addressFormData = {
                province: '',
                district: '',
                ward: '',
                street: '',
                house_number: '',
                detail: ''
            };
            
            if (this.vietnameseAddress) {
                this.vietnameseAddress.clearSelectedAddress();
            }
        },
        
        /**
         * 验证地址表单
         */
        validateAddressForm() {
            const required = ['province', 'district', 'ward'];
            const missing = [];
            
            required.forEach(field => {
                if (!this.addressFormData[field]) {
                    missing.push(field);
                }
            });
            
            if (missing.length > 0) {
                uni.showToast({
                    title: `Vui lòng điền: ${missing.join(', ')}`,
                    icon: 'none'
                });
                return false;
            }
            
            return true;
        },
        
        /**
         * 获取格式化的地址字符串
         */
        getFormattedAddress() {
            return this.vietnameseAddress.formatVietnameseAddress(this.addressFormData);
        }
    }
};

// 全局注册
if (isUniApp) {
    // UniApp环境
    window.UniAppVietnameseAddress = UniAppVietnameseAddress;
    window.vietnameseAddressMixin = vietnameseAddressMixin;
} else {
    // 其他环境
    window.VietnameseAddressIntegration = {
        UniAppVietnameseAddress,
        vietnameseAddressMixin
    };
} 