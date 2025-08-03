 <div class="card">
    <div class="card-header border bottom">
        <h4 class="card-title">Thêm địa chỉ người nhận (Việt Nam)</h4>
        <small class="text-muted">Sử dụng tìm kiếm hoặc bản đồ để chọn địa chỉ chính xác</small>
    </div>
    <div class="card-body">
        <!-- 地址搜索和地图区域 -->
        <div class="form-section mb-4" style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h5 class="mb-3">🔍 Tìm kiếm địa chỉ</h5>
            
            <!-- 地址搜索框 -->
            <div class="form-group">
                <div id="vietnamese-address-autocomplete" class="autocomplete-container">
                    <!-- 搜索框将由JS组件动态创建 -->
                </div>
            </div>
            
            <!-- 地图容器 -->
            <div class="map-container" style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background: #e9ecef; padding: 10px; border-bottom: 1px solid #ddd;">
                    <strong>🗺️ Chọn vị trí trên bản đồ</strong>
                    <small class="text-muted ml-2">(Nhấp vào bản đồ để chọn địa chỉ chính xác)</small>
                </div>
                <div id="vietnamese-address-map" style="height: 300px;"></div>
            </div>
        </div>

        <div class="row">
            <div class="col-sm-12">
                <form role="form" id="vietnameseAddressForm">
                    
                    <!-- 收件人基本信息 -->
                    <div class="form-group row">
                        <label class="col-sm-2 col-form-label control-label">Họ và tên người nhận *</label>
                        <div class="col-sm-3">
                            <input type="text" class="form-control" name="address[name]" placeholder="Nhập họ và tên" required="true">
                        </div>
                        
                        <?php if($setting['address_setting']['is_identitycard']) : ?>
                        <label class="col-sm-1 col-form-label control-label">CMND/CCCD</label>
                        <div class="col-sm-3">
                            <input type="text" class="form-control" name="address[identitycard]" placeholder="Số CMND/CCCD">
                        </div>
                        <?php endif; ?>
                        
                        <?php if($setting['address_setting']['is_clearancecode']) : ?>
                        <label class="col-sm-1 col-form-label control-label">Mã thông quan</label>
                        <div class="col-sm-2">
                            <input type="text" class="form-control" name="address[clearancecode]" placeholder="Mã thông quan">
                        </div>
                        <?php endif; ?>
                    </div>
                    
                    <!-- 联系方式 -->
                    <div class="form-group row">
                        <label class="col-sm-2 col-form-label control-label">Số điện thoại *</label>
                        <?php if($setting['address_setting']['is_tel_code']) : ?>
                        <div class="col-sm-1">
                            <input type="text" class="form-control" name="address[tel_code]" placeholder="+84" value="+84">
                        </div>
                        <?php endif; ?>
                        <div class="col-sm-3">
                            <input type="text" class="form-control" name="address[phone]" placeholder="Số điện thoại" required="">
                        </div>
                        <div class="col-sm-2">
                            <input type="hidden" class="form-control" name="address[addressty]" value="0">
                        </div>
                    </div>
                    
                    <!-- 地址信息 - 越南标准格式 -->
                    <div class="form-group row">
                        <label class="col-sm-2 col-form-label control-label">Quốc gia *</label>
                        <div class="col-sm-2">
                                <select class="form-control" name="address[country_id]">
                                <option value="1" selected>Việt Nam</option>
                                <?php if (isset($countryList) && !$countryList->isEmpty()):
                                foreach ($countryList as $countryitem): ?>
                                    <option value="<?= $countryitem['id'] ?>" <?= $countryitem['title'] == 'Việt Nam' ? 'selected' : '' ?>>
                                        <?= $countryitem['title'] ?>
                                    </option>
                                <?php endforeach; endif; ?>
                            </select>
                        </div>
                        
                        <!-- 省/市 -->
                        <label class="col-sm-1 col-form-label control-label">Tỉnh/TP *</label>
                        <div class="col-sm-2">
                            <input type="text" class="form-control vietnamese-province" name="address[province]" 
                                   placeholder="Tỉnh/Thành phố" required="" readonly>
                        </div>
                        
                        <!-- 区/县 -->
                        <label class="col-sm-1 col-form-label control-label">Quận/Huyện *</label>
                        <div class="col-sm-2">
                            <input type="text" class="form-control vietnamese-district" name="address[city]" 
                                   placeholder="Quận/Huyện" required="" readonly>
                        </div>
                    </div>

                    <div class="form-group row">
                        <!-- 坊/社 -->
                        <label class="col-sm-2 col-form-label control-label">Phường/Xã *</label>
                        <div class="col-sm-2">
                            <input type="text" class="form-control vietnamese-ward" name="address[region]" 
                                   placeholder="Phường/Xã" required="" readonly>
                        </div>
                        
                        <!-- 街道 -->
                        <label class="col-sm-1 col-form-label control-label">Đường/Phố</label>
                        <div class="col-sm-2">
                            <input type="text" class="form-control vietnamese-street" name="address[street]" 
                                   placeholder="Tên đường/phố">
                        </div>
                        
                        <!-- 门牌号 -->
                        <label class="col-sm-1 col-form-label control-label">Số nhà</label>
                        <div class="col-sm-2">
                            <input type="text" class="form-control vietnamese-house-number" name="address[door]" 
                                   placeholder="Số nhà (VD: 123, 45A)">
                        </div>
                    </div>

                    <!-- 详细地址 -->
                    <div class="form-group row">
                        <label class="col-sm-2 col-form-label control-label">Địa chỉ chi tiết *</label>
                        <div class="col-sm-6">
                            <textarea class="form-control vietnamese-detail" name="address[detail]" rows="3"
                                placeholder="Địa chỉ đầy đủ sẽ được điền tự động khi bạn chọn từ tìm kiếm hoặc bản đồ" required=""></textarea>
                        </div>
                        
                        <!-- 邮编 -->
                        <?php if($setting['address_setting']['is_code']) : ?>
                        <label class="col-sm-1 col-form-label control-label">Mã bưu điện</label>
                        <div class="col-sm-2">
                            <input type="text" class="form-control" name="address[code]" placeholder="Mã bưu điện">
                        </div>
                        <?php endif; ?>
                    </div>

                    <!-- 额外信息 -->
                    <?php if($setting['address_setting']['is_email']) : ?>
                    <div class="form-group row">
                        <label class="col-sm-2 col-form-label control-label">Email</label>
                        <div class="col-sm-4">
                            <input type="email" class="form-control" name="address[email]" placeholder="Email (không bắt buộc)">
                        </div>
                        </div>
                        <?php endif; ?>
                    
                    <!-- 隐藏字段存储坐标 -->
                    <input type="hidden" id="latitude" name="address[latitude]">
                    <input type="hidden" id="longitude" name="address[longitude]">
                    
                    <!-- 提交按钮 -->
                    <div class="form-group row">
                        <div class="col-sm-12">
                            <button type="button" class="btn btn-outline-secondary mr-2" onclick="clearVietnameseAddress()">
                                🗑️ Xóa tất cả
                            </button>
                            <button type="button" class="btn btn-gradient-success address">
                                💾 Lưu địa chỉ
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- 地址预览 -->
        <div id="vietnamese-address-preview" class="card mt-3" style="display: none;">
            <div class="card-header">
                <h5 class="card-title mb-0">👁️ Xem trước địa chỉ đã chọn</h5>
            </div>
            <div class="card-body">
                <div id="vietnamese-preview-content"></div>
            </div>
        </div>
    </div>
</div>

<!-- 加载越南地址组件 -->
<link href="https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js"></script>
<script src="/html5/vietnamese-address-component.js"></script>

<script>
// 越南地址组件
let vietnameseAddressComponent;

$(document).ready(function() {
    // 初始化越南地址组件
    initVietnameseAddressComponent();
    
    // 绑定表单提交事件
    bindFormSubmitEvent();
});

/**
 * 初始化越南地址组件
 */
function initVietnameseAddressComponent() {
    // 设置Goong API密钥
    if (typeof goongjs !== 'undefined') {
        goongjs.accessToken = '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj';
    }
    
    // 创建地址组件实例
    vietnameseAddressComponent = new VietnameseAddressComponent({
        apiKey: '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj',
        apiBaseUrl: '/api/goong-address',
        mapContainer: 'vietnamese-address-map',
        autocompleteContainer: 'vietnamese-address-autocomplete',
        defaultCenter: [106.6297, 10.8231], // Ho Chi Minh City
        defaultZoom: 12
    });
    
    // 监听地址选择事件
    document.addEventListener('vietnameseAddressSelected', function(event) {
        const addressData = event.detail;
        updateVietnameseAddressForm(addressData);
        updateAddressPreview(addressData);
    });
}

/**
 * 更新越南地址表单
 */
function updateVietnameseAddressForm(addressData) {
    if (!addressData || !addressData.vietnamese_address) return;
    
    const vietnameseAddr = addressData.vietnamese_address;
    
    // 填充地址字段
    if (vietnameseAddr.province) {
        $('.vietnamese-province').val(vietnameseAddr.province);
    }
    
    if (vietnameseAddr.district) {
        $('.vietnamese-district').val(vietnameseAddr.district);
    }
    
    if (vietnameseAddr.ward) {
        $('.vietnamese-ward').val(vietnameseAddr.ward);
    }
    
    if (vietnameseAddr.street) {
        $('.vietnamese-street').val(vietnameseAddr.street);
    }
    
    if (vietnameseAddr.house_number) {
        $('.vietnamese-house-number').val(vietnameseAddr.house_number);
    }
    
    // 填充完整地址
    if (addressData.formatted_address) {
        $('.vietnamese-detail').val(addressData.formatted_address);
    }
    
    // 保存坐标
    if (addressData.geometry && addressData.geometry.location) {
        $('#latitude').val(addressData.geometry.location.lat);
        $('#longitude').val(addressData.geometry.location.lng);
    }
    
    // 显示成功提示
    showSuccessMessage('Đã chọn địa chỉ thành công!');
}

/**
 * 更新地址预览
 */
function updateAddressPreview(addressData) {
    const previewCard = $('#vietnamese-address-preview');
    const previewContent = $('#vietnamese-preview-content');
    
    if (addressData) {
        const vietnameseAddr = addressData.vietnamese_address || {};
        
        const previewHtml = `
            <div class="row">
                <div class="col-md-8">
                    <h6>Địa chỉ đã chọn:</h6>
                    <p class="mb-2"><strong>${addressData.formatted_address || 'N/A'}</strong></p>
                    
                    <h6>Phân tích chi tiết:</h6>
                    <div class="row">
                        <div class="col-sm-6">
                            <ul class="list-unstyled">
                                ${vietnameseAddr.province ? `<li><strong>Tỉnh/TP:</strong> ${vietnameseAddr.province}</li>` : ''}
                                ${vietnameseAddr.district ? `<li><strong>Quận/Huyện:</strong> ${vietnameseAddr.district}</li>` : ''}
                                ${vietnameseAddr.ward ? `<li><strong>Phường/Xã:</strong> ${vietnameseAddr.ward}</li>` : ''}
                            </ul>
                        </div>
                        <div class="col-sm-6">
                            <ul class="list-unstyled">
                                ${vietnameseAddr.street ? `<li><strong>Đường:</strong> ${vietnameseAddr.street}</li>` : ''}
                                ${vietnameseAddr.house_number ? `<li><strong>Số nhà:</strong> ${vietnameseAddr.house_number}</li>` : ''}
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    ${addressData.geometry && addressData.geometry.location ? `
                        <h6>Tọa độ:</h6>
                        <p>
                            <strong>Vĩ độ:</strong> ${addressData.geometry.location.lat}<br>
                            <strong>Kinh độ:</strong> ${addressData.geometry.location.lng}
                        </p>
                    ` : ''}
                </div>
            </div>
        `;
        
        previewContent.html(previewHtml);
        previewCard.show();
    } else {
        previewCard.hide();
    }
}

/**
 * 清空越南地址
 */
function clearVietnameseAddress() {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả thông tin địa chỉ?')) {
        // 清空表单
        $('#vietnameseAddressForm')[0].reset();
        
        // 清空地址组件
        if (vietnameseAddressComponent) {
            vietnameseAddressComponent.clearAddress();
        }
        
        // 隐藏预览
        $('#vietnamese-address-preview').hide();
        
        // 重置国家选择为越南
        $('select[name="address[country_id]"]').val('1');
        
        showSuccessMessage('Đã xóa thông tin địa chỉ!');
    }
}

/**
 * 绑定表单提交事件
 */
function bindFormSubmitEvent() {
    $(".address").click(function(e) {
        e.preventDefault();
        
        var formData = getFormData();
        
        // 验证必填字段
        if (!validateVietnameseAddressForm(formData)) {
            return;
        }
        
        // 提交地址
        submitVietnameseAddress(formData);
    });
}

/**
 * 获取表单数据
 */
function getFormData() {
     var formJson = {};
    var formArray = $('#vietnameseAddressForm').serializeArray();
    
    $.each(formArray, function(i, field) {
        formJson[field.name] = field.value;
    });
    
    return formJson;
}

/**
 * 验证越南地址表单
 */
function validateVietnameseAddressForm(formData) {
    // 验证收件人姓名
    if (!formData['address[name]'] || formData['address[name]'].trim() === '') {
        showErrorMessage('Vui lòng nhập họ và tên người nhận!');
        return false;
    }
    
    // 验证电话号码
    if (!formData['address[phone]'] || formData['address[phone]'].trim() === '') {
        showErrorMessage('Vui lòng nhập số điện thoại!');
        return false;
    }
    
    // 验证省份
    if (!formData['address[province]'] || formData['address[province]'].trim() === '') {
        showErrorMessage('Vui lòng chọn Tỉnh/Thành phố!');
        return false;
    }
    
    // 验证区县
    if (!formData['address[city]'] || formData['address[city]'].trim() === '') {
        showErrorMessage('Vui lòng chọn Quận/Huyện!');
        return false;
    }
    
    // 验证坊/社
    if (!formData['address[region]'] || formData['address[region]'].trim() === '') {
        showErrorMessage('Vui lòng chọn Phường/Xã!');
         return false;
     }
     
    // 验证详细地址
    if (!formData['address[detail]'] || formData['address[detail]'].trim() === '') {
        showErrorMessage('Vui lòng nhập địa chỉ chi tiết!');
         return false;
     }
    
    return true;
}

/**
 * 提交越南地址
 */
function submitVietnameseAddress(formData) {
    // 显示加载状态
    var submitButton = $('.address');
    var originalText = submitButton.text();
    submitButton.prop('disabled', true).text('Đang lưu...');
    
    var url = "<?php echo(urlCreate('/web/user/address')) ?>";

     $.ajax({
        type: 'POST',
        url: url,
        data: formData,
        dataType: 'json',
        success: function(response) {
            if (response.code === 1) {
                showSuccessMessage('Lưu địa chỉ thành công!');
                
                // 延迟跳转
                setTimeout(function() {
                    var redirectUrl = "<?php echo(urlCreate('/web/user/address')) ?>";
                    window.location.href = redirectUrl;
                }, 1500);
            } else {
                showErrorMessage(response.msg || 'Lỗi khi lưu địa chỉ!');
        }
        },
        error: function() {
            showErrorMessage('Có lỗi xảy ra, vui lòng thử lại!');
        },
        complete: function() {
            // 恢复按钮状态
            submitButton.prop('disabled', false).text(originalText);
        }
    });
}

/**
 * 显示成功消息
 */
function showSuccessMessage(message) {
    // 可以使用现有的通知系统或简单的alert
    if (typeof toastr !== 'undefined') {
        toastr.success(message);
    } else {
        alert(message);
    }
}

/**
 * 显示错误消息
 */
function showErrorMessage(message) {
    // 可以使用现有的通知系统或简单的alert
    if (typeof toastr !== 'undefined') {
        toastr.error(message);
    } else {
        alert(message);
    }
}
</script>						

<style>
/* 越南地址表单样式 */
.vietnamese-province,
.vietnamese-district,
.vietnamese-ward {
    background-color: #f8f9fa;
    cursor: pointer;
}

.vietnamese-province:focus,
.vietnamese-district:focus,
.vietnamese-ward:focus {
    background-color: #fff;
}

.autocomplete-container {
    position: relative;
}

.address-suggestions {
    position: absolute;
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
    background: white;
    border: 1px solid #ddd;
    border-top: none;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    width: 100%;
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

#vietnamese-address-map {
    width: 100%;
    height: 300px;
}

.form-section {
    border-left: 4px solid #007bff;
}

.required {
    color: red;
}
</style>						
						