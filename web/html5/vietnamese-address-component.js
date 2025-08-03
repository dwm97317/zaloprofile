/**
 * 越南地址组件
 * 集成Goong API，提供地址补全和地图选点功能
 */
class VietnameseAddressComponent {
    constructor(options = {}) {
        this.options = {
            apiKey: '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj',
            apiBaseUrl: '/api/goong-address',
            mapContainer: 'address-map',
            autocompleteContainer: 'address-autocomplete',
            resultContainer: 'address-result',
            debug: true,
            defaultCenter: [105.8342, 21.0278], // Hà Nội
            defaultZoom: 12,
            ...options
        };
        
        this.map = null;
        this.marker = null;
        this.autocompleteResults = [];
        this.selectedAddress = null;
        
        this.init();
    }
    
    /**
     * 初始化组件
     */
    init() {
        this.loadGoongJS().then(() => {
            this.initMap();
            this.initAutocomplete();
            this.bindEvents();
        }).catch(error => {
            console.error('Goong JS 加载失败:', error);
        });
    }
    
    /**
     * 动态加载Goong JS库
     */
    loadGoongJS() {
        return new Promise((resolve, reject) => {
            if (window.goongjs) {
                resolve();
                return;
            }
            
            // 加载CSS
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css';
            document.head.appendChild(cssLink);
            
            // 加载JS
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js';
            script.onload = () => {
                goongjs.accessToken = this.options.apiKey;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    /**
     * 初始化地图
     */
    initMap() {
        const mapContainer = document.getElementById(this.options.mapContainer);
        if (!mapContainer) {
            console.warn('地图容器未找到:', this.options.mapContainer);
            return;
        }
        
        this.map = new goongjs.Map({
            container: this.options.mapContainer,
            style: 'https://tiles.goong.io/assets/goong_map_web.json',
            center: this.options.defaultCenter,
            zoom: this.options.defaultZoom
        });
        
        // 地图点击事件
        this.map.on('click', (e) => {
            this.handleMapClick(e.lngLat);
        });
        
        // 添加地理定位控件
        this.map.addControl(new goongjs.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        }));
        
        // 添加导航控件
        this.map.addControl(new goongjs.NavigationControl());
    }
    
    /**
     * 初始化地址补全
     */
    initAutocomplete() {
        const autocompleteContainer = document.getElementById(this.options.autocompleteContainer);
        if (!autocompleteContainer) {
            console.warn('地址补全容器未找到:', this.options.autocompleteContainer);
            return;
        }
        
        // 创建搜索输入框
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'address-search-input';
        searchInput.className = 'form-control';
        searchInput.placeholder = 'Nhập địa chỉ để tìm kiếm...';
        
        // 创建结果列表
        const resultsList = document.createElement('ul');
        resultsList.id = 'address-suggestions';
        resultsList.className = 'list-group address-suggestions';
        resultsList.style.display = 'none';
        
        autocompleteContainer.appendChild(searchInput);
        autocompleteContainer.appendChild(resultsList);
        
        // 绑定输入事件
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                this.hideAutocompleteResults();
                return;
            }
            
            searchTimeout = setTimeout(() => {
                this.searchAddresses(query);
            }, 300);
        });
        
        // 点击其他地方隐藏结果
        document.addEventListener('click', (e) => {
            if (!autocompleteContainer.contains(e.target)) {
                this.hideAutocompleteResults();
            }
        });
    }
    
    /**
     * 绑定其他事件
     */
    bindEvents() {
        // 监听表单提交
        const forms = document.querySelectorAll('form[data-vietnamese-address]');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.validateAddressForm(e, form);
            });
        });
    }
    
    /**
     * 搜索地址
     */
    async searchAddresses(query) {
        try {
            const userLocation = this.getUserLocation();
            const params = new URLSearchParams({
                input: query,
                limit: 10
            });
            
            if (userLocation) {
                params.append('lat', userLocation.lat);
                params.append('lng', userLocation.lng);
            }
            
            const response = await fetch(`${this.options.apiBaseUrl}/autocomplete?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (data.code === 1 && data.data.suggestions) {
                this.showAutocompleteResults(data.data.suggestions);
            } else {
                this.hideAutocompleteResults();
            }
        } catch (error) {
            console.error('地址搜索失败:', error);
            this.hideAutocompleteResults();
        }
    }
    
    /**
     * 显示地址补全结果
     */
    showAutocompleteResults(suggestions) {
        const resultsList = document.getElementById('address-suggestions');
        if (!resultsList) return;
        
        resultsList.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item list-group-item-action';
            listItem.style.cursor = 'pointer';
            
            const mainText = suggestion.structured_formatting?.main_text || suggestion.description;
            const secondaryText = suggestion.structured_formatting?.secondary_text || '';
            
            listItem.innerHTML = `
                <div class="address-suggestion-item">
                    <div class="main-text">${mainText}</div>
                    ${secondaryText ? `<div class="secondary-text text-muted small">${secondaryText}</div>` : ''}
                </div>
            `;
            
            listItem.addEventListener('click', () => {
                this.selectAddress(suggestion);
            });
            
            resultsList.appendChild(listItem);
        });
        
        resultsList.style.display = 'block';
    }
    
    /**
     * 隐藏地址补全结果
     */
    hideAutocompleteResults() {
        const resultsList = document.getElementById('address-suggestions');
        if (resultsList) {
            resultsList.style.display = 'none';
        }
    }
    
    /**
     * 选择地址
     */
    async selectAddress(suggestion) {
        try {
            const response = await fetch(`${this.options.apiBaseUrl}/place-detail?place_id=${suggestion.place_id}`);
            const data = await response.json();
            
            if (data.code === 1 && data.data.place) {
                const placeDetail = data.data.place;
                this.selectedAddress = placeDetail;
                
                // 更新地图位置
                if (placeDetail.geometry && placeDetail.geometry.location) {
                    const location = placeDetail.geometry.location;
                    this.updateMapLocation(location.lng, location.lat);
                }
                
                // 填充表单
                this.fillAddressForm(placeDetail.vietnamese_address);
                
                // 更新搜索框
                const searchInput = document.getElementById('address-search-input');
                if (searchInput) {
                    searchInput.value = placeDetail.formatted_address;
                }
                
                this.hideAutocompleteResults();
                
                // 触发地址选择事件
                this.dispatchAddressSelectEvent(placeDetail);
            }
        } catch (error) {
            console.error('获取地点详情失败:', error);
        }
    }
    
    /**
     * 处理地图点击
     */
    async handleMapClick(lngLat) {
        try {
            const response = await fetch(`${this.options.apiBaseUrl}/reverse-geocode?lat=${lngLat.lat}&lng=${lngLat.lng}`);
            const data = await response.json();
            
            if (data.code === 1 && data.data.address) {
                const addressInfo = data.data.address;
                this.selectedAddress = addressInfo;
                
                // 更新标记
                this.updateMapLocation(lngLat.lng, lngLat.lat);
                
                // 填充表单
                this.fillAddressForm(addressInfo.vietnamese_address);
                
                // 更新搜索框
                const searchInput = document.getElementById('address-search-input');
                if (searchInput) {
                    searchInput.value = addressInfo.formatted_address;
                }
                
                // 触发地址选择事件
                this.dispatchAddressSelectEvent(addressInfo);
            }
        } catch (error) {
            console.error('反向地理编码失败:', error);
        }
    }
    
    /**
     * 更新地图位置和标记
     */
    updateMapLocation(lng, lat) {
        if (!this.map) return;
        
        // 移动地图中心
        this.map.flyTo({
            center: [lng, lat],
            zoom: 15
        });
        
        // 更新标记
        if (this.marker) {
            this.marker.remove();
        }
        
        this.marker = new goongjs.Marker()
            .setLngLat([lng, lat])
            .addTo(this.map);
    }
    
    /**
     * 填充地址表单
     */
    fillAddressForm(vietnameseAddress) {
        if (!vietnameseAddress) return;
        
        const mappings = {
            'province': ['province', 'tinh', 'thanhpho'],
            'district': ['district', 'quan', 'huyen'],
            'ward': ['ward', 'phuong', 'xa'],
            'street': ['street', 'duong'],
            'house_number': ['house_number', 'so_nha', 'door']
        };
        
        Object.keys(mappings).forEach(key => {
            if (vietnameseAddress[key]) {
                mappings[key].forEach(fieldName => {
                    const field = document.querySelector(`[name*="${fieldName}"], [name$="[${fieldName}]"], #${fieldName}`);
                    if (field) {
                        field.value = vietnameseAddress[key];
                    }
                });
            }
        });
        
        // 填充详细地址
        const detailField = document.querySelector('[name*="detail"], [name$="[detail]"], #detail');
        if (detailField && vietnameseAddress.formatted_address) {
            detailField.value = vietnameseAddress.formatted_address;
        }
    }
    
    /**
     * 验证地址表单
     */
    validateAddressForm(event, form) {
        const addressData = new FormData(form);
        const vietnameseFields = ['province', 'district', 'ward'];
        const missingFields = [];
        
        vietnameseFields.forEach(field => {
            if (!addressData.get(field) && !addressData.get(`address[${field}]`)) {
                missingFields.push(field);
            }
        });
        
        if (missingFields.length > 0) {
            event.preventDefault();
            alert(`Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`);
            return false;
        }
        
        return true;
    }
    
    /**
     * 获取用户位置
     */
    getUserLocation() {
        // 可以从localStorage获取，或使用其他方式
        const savedLocation = localStorage.getItem('user_location');
        return savedLocation ? JSON.parse(savedLocation) : null;
    }
    
    /**
     * 触发地址选择事件
     */
    dispatchAddressSelectEvent(addressData) {
        const event = new CustomEvent('vietnameseAddressSelected', {
            detail: addressData
        });
        document.dispatchEvent(event);
    }
    
    /**
     * 获取当前选择的地址
     */
    getSelectedAddress() {
        return this.selectedAddress;
    }
    
    /**
     * 清空地址选择
     */
    clearAddress() {
        this.selectedAddress = null;
        
        // 清空搜索框
        const searchInput = document.getElementById('address-search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // 移除地图标记
        if (this.marker) {
            this.marker.remove();
            this.marker = null;
        }
        
        // 重置地图视图
        if (this.map) {
            this.map.flyTo({
                center: this.options.defaultCenter,
                zoom: this.options.defaultZoom
            });
        }
        
        this.hideAutocompleteResults();
    }
}

// CSS样式
const addressComponentCSS = `
<style>
.address-suggestions {
    position: absolute;
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
    background: white;
    border: 1px solid #ddd;
    border-top: none;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.address-suggestion-item .main-text {
    font-weight: 500;
    color: #333;
}

.address-suggestion-item .secondary-text {
    font-size: 0.85em;
    color: #666;
    margin-top: 2px;
}

.list-group-item:hover {
    background-color: #f8f9fa;
}

#${options?.mapContainer || 'address-map'} {
    height: 300px;
    width: 100%;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.autocomplete-container {
    position: relative;
}

.goongjs-ctrl-geolocate {
    background: white;
}
</style>
`;

// 添加CSS到页面
if (!document.getElementById('vietnamese-address-css')) {
    const style = document.createElement('style');
    style.id = 'vietnamese-address-css';
    style.textContent = addressComponentCSS.replace('<style>', '').replace('</style>', '');
    document.head.appendChild(style);
}

// 全局暴露
window.VietnameseAddressComponent = VietnameseAddressComponent; 