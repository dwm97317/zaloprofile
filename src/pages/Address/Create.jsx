import React, { useEffect, useState } from "react";
import { Page, useNavigate, Button, Input, Sheet } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { addressFormState, addressInfoState, countryState } from "../../state";
import request from "../../utils/request";
import Header from "../../components/Header/Header";
import DynamicAddressForm from "../../components/DynamicAddressForm";
import AddressApi from "../../utils/addressApi";
import {
  formatVietnameseAddress
} from "../../utils/vietnameseAddress";
import "./Index.scss";
import "./Create.scss";
import { getAccessToken, getLocation, showToast } from "zmp-sdk";
import util from "../../utils/util";
import Loading from "../../components/Loading/Index";


const AddressPage = () => {
  const country = useRecoilValue(countryState);
  const saveAddressFormState = useSetRecoilState(addressFormState);
  const addressForm = useRecoilValue(addressFormState);
  const setCountryData = useSetRecoilState(countryState);
  const navigate = useNavigate();
  const requireFormFields = ["name", "userphones"]; // Các trường bắt buộc
  const [form, setForm] = useState({
    region: "",
    detail: "",
    userstree: "",
    name: "",
    userphones: "",
    telcode: "84",
    country_id: 1
  });
  const [formData, setFormData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const addressInfo = useRecoilValue(addressInfoState);

  // 地图中心点状态
  const [mapCenter, setMapCenter] = useState({
    lat: 10.762622, // 胡志明市中心
    lng: 106.660172
  });

  // 地址选择器状态
  const [addressPicker, setaddressPicker] = useState(false);



  // 新增：专用地址显示栏状态
  const [confirmedAddress, setConfirmedAddress] = useState({
    fullAddress: '',        // 完整地址字符串
    province: '',          // 省份
    district: '',          // 区县
    ward: '',              // 坊社
    street: '',            // 街道
    houseNumber: '',       // 门牌号
    coordinates: null,     // 坐标信息
    isConfirmed: false     // 是否已确认
  });















  // 处理动态地址表单变化 - 越南文化特色优化
  const handleDynamicAddressChange = (addressData) => {
    console.log("=== 动态地址表单变化 ===");
    console.log("接收到的地址数据:", addressData);

    // 智能处理地址数据，避免重复
    let fullDetailAddress = '';

    if (addressData.detail && addressData.detail.trim().length > 0) {
      // 如果已有完整地址，直接使用
      fullDetailAddress = addressData.detail.trim();
    } else {
      // 否则使用越南地址格式化工具构建
      const vietnameseAddressData = {
        houseNumber: addressData.houseNumber || '',
        street: addressData.street || '',
        ward: addressData.ward || '',
        district: addressData.district || '',
        province: addressData.province || '',
        country: 'Việt Nam'
      };

      fullDetailAddress = formatVietnameseAddress(vietnameseAddressData);
    }

    // 更新新的地址显示栏
    const newConfirmedAddress = {
      fullAddress: fullDetailAddress,
      province: addressData.province || '',
      district: addressData.district || '',
      ward: addressData.ward || '',
      street: addressData.street || '',
      houseNumber: addressData.houseNumber || '',
      coordinates: addressData.coordinates || null,
      isConfirmed: true
    };

    setConfirmedAddress(newConfirmedAddress);

    const updatedForm = {
      ...form,
      // 越南文化特色的地址处理 - 从确认地址栏获取数据
      detail: fullDetailAddress,        // 主要的详细地址字段
      userstree: fullDetailAddress,     // 街道字段也使用完整地址

      // 保留原有的省市区字段（虽然后台已关闭，但保持兼容性）
      userProvince: addressData.province || '',
      userchengshi: addressData.district || '',
      userregion: addressData.ward || '',
      userdoor: addressData.houseNumber || '',

      // 坐标信息
      latitude: addressData.coordinates?.lat || '',
      longitude: addressData.coordinates?.lng || '',

      // 构建用于显示的地区字符串
      region: [
        addressData.province,
        addressData.district,
        addressData.ward
      ].filter(Boolean).join(', ')
    };

    console.log("=== 地址数据处理结果 ===");
    console.log("原始地址数据:", addressData.detail);
    console.log("格式化地址:", fullDetailAddress);
    console.log("新的确认地址栏数据:", newConfirmedAddress);
    console.log("更新后的表单数据:", updatedForm);
    console.log("========================");

    if (addressData.coordinates) {
      setMapCenter({
        lat: addressData.coordinates.lat,
        lng: addressData.coordinates.lng
      });
    }

    setForm(updatedForm);
    saveAddressFormState(updatedForm);

    console.log("=== 动态地址表单变化完成 ===");
  };



  const initCreate = () => {
    if (addressInfo && addressInfo.address_id) {
      console.log("=== 越南地址数据回填 ===");
      console.log("原始地址信息:", addressInfo);

      // 使用越南地址格式化工具构建人性化的地址
      const vietnameseAddressData = {
        houseNumber: addressInfo.door || '',
        street: addressInfo.street || '',
        ward: addressInfo.region || '',
        district: addressInfo.city || '',
        province: addressInfo.province || '',
        country: addressInfo.country || 'Việt Nam'
      };

      // 按越南人习惯格式化地址：门牌号 + 街道 + 坊 + 区 + 省
      const formattedAddress = formatVietnameseAddress(vietnameseAddressData);

      // 如果格式化后的地址为空，使用原始detail字段
      const finalAddress = formattedAddress || addressInfo.detail || '';

      const editForm = {
        ...form,
        // 基本信息
        name: addressInfo.name || '',
        userphones: addressInfo.phone || '',
        identitycard: addressInfo.identitycard || '',
        clearancecode: addressInfo.clearancecode || '',
        telcode: addressInfo.tel_code || '84',

        // 越南文化特色的地址回填
        // 使用格式化后的完整地址，符合越南人的阅读习惯
        detail: finalAddress,
        userstree: finalAddress, // 街道字段也使用完整地址

        // 清空省市区字段，因为后台已关闭行政区域选择
        userProvince: '',
        userchengshi: '',
        userregion: '',

        // 其他信息
        userdoor: addressInfo.door || '',
        usercode: addressInfo.code || '',
        useremils: addressInfo.email || '',

        // 坐标信息
        latitude: addressInfo.latitude || '',
        longitude: addressInfo.longitude || '',

        // 国家信息
        country_id: addressInfo.country_id || 1
      };

      // 同时更新新的地址显示栏
      const backfillConfirmedAddress = {
        fullAddress: finalAddress,
        province: addressInfo.province || '',
        district: addressInfo.city || '',
        ward: addressInfo.region || '',
        street: addressInfo.street || '',
        houseNumber: addressInfo.door || '',
        coordinates: addressInfo.latitude && addressInfo.longitude ? {
          lat: parseFloat(addressInfo.latitude),
          lng: parseFloat(addressInfo.longitude)
        } : null,
        isConfirmed: true
      };

      setConfirmedAddress(backfillConfirmedAddress);

      console.log("越南格式化地址数据:", vietnameseAddressData);
      console.log("格式化后的地址:", formattedAddress);
      console.log("最终回填地址:", finalAddress);
      console.log("回填的确认地址栏数据:", backfillConfirmedAddress);
      console.log("回填后的表单数据:", editForm);

      setForm(editForm);
      saveAddressFormState(editForm);

      // 如果有坐标信息，设置地图中心
      if (addressInfo.latitude && addressInfo.longitude) {
        setMapCenter({
          lat: parseFloat(addressInfo.latitude),
          lng: parseFloat(addressInfo.longitude)
        });
      }

      console.log("=== 越南地址数据回填完成 ===");
    }
  };

  // Xử lý nhập liệu
  const handleInput = (e) => {
    const field = e.target.dataset.field;
    const updatedForm = {
      ...form,
      [field]: e.target.value
    };
    setForm(updatedForm);
    saveAddressFormState({ ...updatedForm, ...formData });
  };



  // Kiểm tra form
  const checkForm = () => {
    let bool = true;
    console.log(form, "form");
    requireFormFields.map((res) => {
      if (form[res] == "" || form[res] == undefined) bool = false;
    });
    return bool;
  };

  // Gửi dữ liệu
  const handleSubmit = async () => {
    if (!checkForm()) {
      console.log("error");
      showToast({
        message: "Vui lòng điền đầy đủ các trường bắt buộc",
      });
      return;
    }
    
    setLoading(true);
    setLoadingText("Đang lưu địa chỉ...");
    
    try {
      // 准备地址数据，确保格式符合后端 API 期望
      // 后端通过 explode(',', $data['region']) 解析地区信息
      // region[0] = country, region[1] = province, region[2] = city, region[3] = region

      // 越南文化特色的地址处理 - 优先使用确认地址栏的数据
      // 如果有确认地址，使用确认地址栏的数据；否则使用表单数据
      const fullDetailAddress = confirmedAddress.isConfirmed
        ? confirmedAddress.fullAddress
        : (form.detail || form.userstree || form.region || '');

      // 构建简化的地区字符串 - 只包含越南国家信息
      const regionString = 'Việt Nam,,,'; // 国家,省,市,区 - 省市区留空

      const addressData = {
        // 基本信息
        name: form.name || '',
        phone: form.userphones || '',
        identitycard: form.identitycard || '',
        clearancecode: form.clearancecode || '',

        // 电话区号 - 后端字段名是 telcode，不是 tel_code
        telcode: '84', // 越南国际区号

        // 国家信息 - 统一设置为越南
        country_id: 1, // 越南 ID

        // 地区信息 - 后端通过 region 字段解析
        region: regionString,

        // 详细地址信息 - 简化处理
        userstree: fullDetailAddress,     // 街道字段也使用完整地址
        door: form.userdoor || '',        // 门牌号
        code: form.usercode || '',        // 邮编
        email: form.useremils || '',      // 邮箱

        // 详细地址 - 包含完整的地址信息
        detail: fullDetailAddress || '详细地址信息',

        // 坐标信息
        latitude: form.latitude || '',
        longitude: form.longitude || ''
      };

      console.log("=== 地址数据构建详情 ===");
      console.log("完整详细地址:", fullDetailAddress);
      console.log("简化的 region 字符串:", regionString);
      console.log("提交地址数据 (符合后端格式):", addressData);
      console.log("========================");
      
      const response = await request.post("address/add&wxapp_id=10001", addressData);
      
      if (response.code === 1) {
        showToast({
          message: "Thêm địa chỉ thành công",
        });
        saveAddressFormState("");
        // 返回上一页
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } else {
        throw new Error(response.msg || "Thêm địa chỉ thất bại");
      }
    } catch (error) {
      console.error("保存地址失败:", error);
      showToast({
        message: error.message || "Lỗi khi lưu địa chỉ",
      });
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };
  // 使用Goong API获取地址信息
  const getAddressFromPoi = async (data) => {
    try {
      setLoading(true);
      setLoadingText("Đang lấy thông tin địa chỉ...");
      
      const response = await AddressApi.reverseGeocode(data.latitude, data.longitude);
      
      if (response.code === 1 && response.data.address) {
        const address = response.data.address;
        const vietnameseAddress = address.vietnamese_address || {};
        
        // 越南文化特色的反向地理编码处理
        // 构建符合越南人习惯的地址格式
        const vietnameseAddressData = {
          houseNumber: vietnameseAddress.house_number || '',
          street: vietnameseAddress.street || '',
          ward: vietnameseAddress.ward || '',           // 坊/社 (Phường/Xã)
          district: vietnameseAddress.district || '',   // 区/县 (Quận/Huyện)
          province: vietnameseAddress.province || '',   // 省/市 (Tỉnh/Thành phố)
          country: 'Việt Nam'
        };

        // 使用越南地址格式化工具，按越南人习惯排序
        const formattedAddress = formatVietnameseAddress(vietnameseAddressData);

        // 简化的地区字符串 - 只包含越南
        const regionString = 'Việt Nam,,,'; // 国家,省,市,区 - 省市区留空

        const updatedForm = {
          ...form,
          latitude: data.latitude,
          longitude: data.longitude,
          // 强制设置国家信息为越南
          country_id: 1,
          telcode: '84',

          // 越南文化特色的地址信息处理
          detail: formattedAddress,         // 使用格式化后的越南地址
          userstree: formattedAddress,      // 街道字段也使用格式化地址
          userdoor: vietnameseAddress.house_number || '',

          // 清空省市区字段，因为使用完整地址格式
          userProvince: '',
          userchengshi: '',
          userregion: '',

          // 后端期望的 region 格式
          region: regionString
        };

        console.log("=== 越南文化特色反向地理编码 ===");
        console.log("原始地理编码数据:", vietnameseAddress);
        console.log("越南地址数据结构:", vietnameseAddressData);
        console.log("格式化后的越南地址:", formattedAddress);
        console.log("简化的 region 字符串:", regionString);
        console.log("更新后的表单数据:", updatedForm);
        console.log("=====================================");
        
        setForm(updatedForm);
        saveAddressFormState(updatedForm);
      }
    } catch (error) {
      console.error("获取地址信息失败:", error);
      showToast({
        message: "Không thể lấy thông tin địa chỉ"
      });
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };
  const initLocation = async () => {
    const { token } = await getLocation();
    console.log(token, "token");
    getAccessToken({
      success: (accesstoken) => {
        let data = {};
        data["code"] = token;
        data["accesstoken"] = accesstoken;
        request
          .post("address/parseLocationByToken&wxapp_id=10001", data)
          .then((res) => {
            console.log(res, "res111111");
            if (res.code == 1) {
              const data = res.data.location.data;
              // 调用逆向地址转换
              getAddressFromPoi(data);
            }
          });
      },
    });
  };
  useEffect(() => {
    initCreate();
    initLocation();
    if (country) {
      form["country_id"] = country["id"];
      formData["country"] = country["title"];
      setForm(form);
      setFormData(formData);
      setCountryData("");
      saveAddressFormState({ ...form, ...formData });
    }
    util.setBarPageView("Tạo địa chỉ");

    return () => {};
  }, []);

  return (
    <Page className="page address-create">
      {/* Header với nút quay lại và toggle */}
      <div className="address-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="header-title">Tạo đơn</h1>
        </div>
        <div className="header-right">
          <span className="toggle-label">Thu gọn</span>
          <div className="toggle-switch">
            <input type="checkbox" id="toggle" />
            <label htmlFor="toggle"></label>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar">
        <div className="progress-fill"></div>
      </div>

      <div className="address-form-container">
        {/* Người nhận section */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#e53e3e">
                <circle cx="12" cy="12" r="10" fill="currentColor"/>
                <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="section-title">Người nhận</h2>
            <div className="qr-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="2"/>
                <rect x="13" y="3" width="8" height="8" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="13" width="8" height="8" stroke="currentColor" strokeWidth="2"/>
                <rect x="13" y="13" width="8" height="8" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Quét QR</span>
            </div>
          </div>

          {/* Số điện thoại */}
          <div className="form-field">
            <div className="field-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <Input
              type="tel"
              data-field="userphones"
              onInput={(e) => handleInput(e)}
              defaultValue={form.userphones || addressForm["userphones"] || ''}
              value={form.userphones || ''}
              className="field-input"
              placeholder="Số điện thoại*"
            />
            <div className="field-action">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          {/* Họ và tên */}
          <div className="form-field">
            <div className="field-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <Input
              type="text"
              data-field="name"
              onInput={(e) => handleInput(e)}
              defaultValue={form.name || addressForm["name"] || ''}
              value={form.name || ''}
              className="field-input"
              placeholder="Họ và tên*"
            />
          </div>

          {/* Sử dụng địa danh mới toggle */}
          <div className="form-field toggle-field">
            <div className="toggle-container">
              <div className="toggle-switch-red">
                <input type="checkbox" id="useNewAddress" defaultChecked />
                <label htmlFor="useNewAddress"></label>
              </div>
              <span className="toggle-text">Sử dụng địa danh mới</span>
            </div>
          </div>

          {/* 确认地址栏 - 替换原来的 Địa chỉ chi tiết */}
          {confirmedAddress.isConfirmed ? (
            <div className="confirmed-address-section-inline">
              <div className="confirmed-address-header-inline">
                <div className="address-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#4CAF50" strokeWidth="2" fill="none"/>
                    <circle cx="12" cy="10" r="3" stroke="#4CAF50" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <span className="confirmed-label-inline">Địa chỉ đã xác nhận</span>
                <button
                  className="edit-address-btn-inline"
                  onClick={() => setConfirmedAddress(prev => ({ ...prev, isConfirmed: false }))}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </button>
              </div>

              <div className="confirmed-address-content-inline">
                <div className="full-address-inline">
                  <span className="address-text-inline">{confirmedAddress.fullAddress}</span>
                </div>

                {/* 只在有坐标信息时显示额外信息 */}
                {confirmedAddress.coordinates && (
                  <div className="address-coordinates-inline">
                    <span className="coordinates-label-inline">📍</span>
                    <span className="coordinates-value-inline">
                      {confirmedAddress.coordinates.lat.toFixed(4)}, {confirmedAddress.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="form-field" onClick={() => setaddressPicker(true)}>
              <div className="field-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="field-input address-field">
                <span className="address-placeholder">Địa chỉ chi tiết*</span>
              </div>
              <div className="field-action">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="9,11 12,14 15,10" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Address Form - Powered by Goong API */}
        <div className="dynamic-address-section">
          <DynamicAddressForm
            onAddressChange={handleDynamicAddressChange}
            initialAddress={{
              detail: confirmedAddress.isConfirmed ? confirmedAddress.fullAddress : '',
              province: confirmedAddress.province || form.userProvince || '',
              district: confirmedAddress.district || form.userchengshi || '',
              ward: confirmedAddress.ward || form.userregion || '',
              street: confirmedAddress.street || form.userstree || '',
              coordinates: confirmedAddress.coordinates || (form.latitude && form.longitude ? {
                lat: parseFloat(form.latitude),
                lng: parseFloat(form.longitude)
              } : null)
            }}
          />
        </div>


        {/* Thời gian hẹn giao */}
        <div className="delivery-time-section">
          <div className="delivery-time">
            <span className="delivery-label">Thời gian hẹn giao</span>
            <div className="delivery-value">
              <span>Cả ngày</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="submit-section">
          <Button
            className="submit-btn"
            onClick={(e) => handleSubmit(e)}
            disabled={loading}
          >
            {loading ? loadingText : "Tiếp tục"}
          </Button>
        </div>
      </div>

      {/* Loading component */}
      <Loading is={loading} text={loadingText} />


    </Page>
  );
};

export default AddressPage;
