import React, { useEffect, useState } from "react";
import { Page, useNavigate, Button, Input, Sheet } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { addressFormState, addressInfoState, countryState } from "../../state";
import request from "../../utils/request";
import Header from "../../components/Header/Header";
import GoongAddressPicker from "../../components/GoongAddressPicker/index";
import AddressApi from "../../utils/addressApi";
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
  const [form, setForm] = useState({ region: "" });
  const [formData, setFormData] = useState([]);
  const [addressPicker, setaddressPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const addressInfo = useRecoilValue(addressInfoState);

  // 处理地址选择器返回的数据
  const receiveData = (addressData) => {
    const updatedForm = {
      ...form,
      userProvince: addressData.selectedProvinceName,
      userchengshi: addressData.selectedCityName,
      userregion: addressData.selectedWardName,
      userstree: addressData.street || '',
      userdoor: addressData.house_number || '',
      latitude: addressData.latitude || '',
      longitude: addressData.longitude || '',
      region: [
        addressData.selectedProvinceName,
        addressData.selectedCityName,
        addressData.selectedWardName
      ].filter(Boolean).join(', ')
    };

    setForm(updatedForm);
    saveAddressFormState(updatedForm);
    setaddressPicker(false);
  };

  const initCreate = () => {
    if (addressInfo) {
      // Logic khởi tạo (giữ nguyên)
    }
  };

  // Xử lý nhập liệu
  const handleInput = (e) => {
    const field = e.target.dataset.field;
    form[field] = e.target.value;
    saveAddressFormState({ ...form, ...formData });
  };

  // Chuyển đến trang chọn
  const toTargetSelect = (e, path) => {
    navigate(path);
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
  const handleSubmit = async (e) => {
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
      // 准备地址数据，确保格式正确
      const addressData = {
        ...form,
        // 确保地址字段映射正确
        name: form.name,
        phone: form.userphones,
        identity_card: form.identitycard,
        clearance_code: form.clearancecode,
        tel_code: form.telcode,
        country_id: form.country_id || 1, // 默认越南
        province: form.userProvince,
        city: form.userchengshi,
        region: form.userregion,
        street: form.userstree,
        villages: form.uservillages,
        door: form.userdoor,
        code: form.usercode,
        email: form.useremils,
        detail: form.detail,
        latitude: form.latitude,
        longitude: form.longitude
      };
      
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
        
        const updatedForm = {
          ...form,
          latitude: data.latitude,
          longitude: data.longitude,
          userProvince: vietnameseAddress.province || '',
          userchengshi: vietnameseAddress.district || '',
          userregion: vietnameseAddress.ward || '',
          userstree: vietnameseAddress.street || '',
          userdoor: vietnameseAddress.house_number || '',
          region: [
            vietnameseAddress.province,
            vietnameseAddress.district,
            vietnameseAddress.ward
          ].filter(Boolean).join(', ')
        };
        
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
    window.addEventListener("child-data-event", receiveData);
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
              defaultValue={addressForm["phone"]}
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
              defaultValue={addressForm["name"]}
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

          {/* Địa chỉ chi tiết */}
          <div className="form-field" onClick={() => setaddressPicker(true)}>
            <div className="field-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="field-input address-field">
              {form.region ? (
                <span className="address-text">{form.region}</span>
              ) : (
                <span className="address-placeholder">Địa chỉ chi tiết*</span>
              )}
            </div>
            <div className="field-action">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <polyline points="9,11 12,14 15,10" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Địa chỉ selection dropdowns */}
        <div className="address-selection">
          <div className="dropdown-row">
            <div className="dropdown-field">
              <select className="address-dropdown" defaultValue="">
                <option value="" disabled>Tỉnh/Thành phố *</option>
                <option value="ho-chi-minh">Hồ Chí Minh</option>
                <option value="ha-noi">Hà Nội</option>
                <option value="da-nang">Đà Nẵng</option>
              </select>
              <div className="dropdown-arrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="dropdown-row">
            <div className="dropdown-field half">
              <select className="address-dropdown" defaultValue="">
                <option value="" disabled>Phường/Xã *</option>
                <option value="phuong-1">Phường 1</option>
                <option value="phuong-2">Phường 2</option>
              </select>
              <div className="dropdown-arrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            <div className="dropdown-field half">
              <select className="address-dropdown" defaultValue="">
                <option value="" disabled>Đường...</option>
                <option value="duong-1">Đường Nguyễn Huệ</option>
                <option value="duong-2">Đường Lê Lợi</option>
              </select>
              <div className="dropdown-arrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Map section */}
        <div className="map-section">
          <div className="map-container">
            <div className="map-placeholder">
              <div className="map-content">
                <div className="location-marker">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#007bff">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3" fill="white"/>
                  </svg>
                </div>
                <div className="map-labels">
                  <div className="area-label">KHU 2</div>
                  <div className="street-labels">
                    <span>Vương</span>
                    <span>Trường Mầm non Ka Long</span>
                    <span>Trường THPT Trần Phú</span>
                    <span>Yết Kiêu</span>
                    <span>P. Ka Long</span>
                  </div>
                </div>
              </div>
              <div className="map-error">
                <span>Không lấy được vị trí</span>
              </div>
            </div>
          </div>

          {/* Thời gian hẹn giao */}
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

      {/* Address picker modal */}
      <GoongAddressPicker
        visible={addressPicker}
        onClose={() => setaddressPicker(false)}
        onSelect={receiveData}
        defaultAddress={{
          province: form.userProvince || '',
          district: form.userchengshi || '',
          ward: form.userregion || '',
          street: form.userstree || '',
          house_number: form.userdoor || ''
        }}
      />
    </Page>
  );
};

export default AddressPage;
