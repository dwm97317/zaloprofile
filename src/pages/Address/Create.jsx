import React, { useEffect, useState } from "react";
import { Page, useNavigate, Button, Input, Sheet } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { addressFormState, addressInfoState, countryState } from "../../state";
import request from "../../utils/request";
import Header from "../../components/Header/Header";
import GoongAddressPicker from "../../components/GoongAddressPicker/index";
import AddressApi from "../../utils/addressApi";
import "./Index.scss";
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
  // 处理地址选择器返回的数据
  const receiveData = (addressData) => {
    const updatedForm = {
      ...form,
      userProvince: addressData.selectedProvinceName || addressData.province,
      userchengshi: addressData.selectedCityName || addressData.district,
      userregion: addressData.selectedWardName || addressData.ward,
      userstree: addressData.street || '',
      userdoor: addressData.house_number || '',
      latitude: addressData.latitude || '',
      longitude: addressData.longitude || '',
      region: [
        addressData.selectedProvinceName || addressData.province,
        addressData.selectedCityName || addressData.district,
        addressData.selectedWardName || addressData.ward
      ].filter(Boolean).join(', ')
    };
    
    setForm(updatedForm);
    saveAddressFormState(updatedForm);
    setaddressPicker(false);
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
    <Page className="page freight">
      <Header></Header>
      <div className="freight-box">
        <div className="form" style={{ paddingBottom: "80px" }}>
          <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zalonew.itaoth.com/assets/api/user.png" />
              </div>
              Người nhận
            </div>
            <div className="form-content">
              <div className="form-input">
                <Input
                  type="text"
                  data-field="name"
                  onInput={(e) => handleInput(e)}
                  defaultValue={addressForm["name"]}
                  className="form-input"
                  placeholder="Vui lòng nhập tên người nhận"
                />
              </div>
            </div>
          </div>
          <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zalonew.itaoth.com/assets/api/tel_phone.png" />
              </div>
              Số điện thoại
            </div>
            <div className="form-content">
              <div className="form-content">
                <div className="form-input">
                  <Input
                    type="text"
                    data-field="userphones"
                    onInput={(e) => handleInput(e)}
                    defaultValue={addressForm["phone"]}
                    className="form-input"
                    placeholder="Vui lòng nhập số điện thoại"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zalonew.itaoth.com/assets/api/maitou.png" />
              </div>
              Số CMND/CCCD
            </div>
            <div className="form-content">
              <div className="form-input">
                <Input
                  type="text"
                  data-field="identitycard"
                  onInput={(e) => handleInput(e)}
                  defaultValue={addressForm["identitycard"]}
                  className="form-input"
                  placeholder="Vui lòng nhập số CMND/CCCD"
                />
              </div>
            </div>
          </div>
          <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zalonew.itaoth.com/assets/api/maitou.png" />
              </div>
              Mã thông quan
            </div>
            <div className="form-content">
              <div className="form-input">
                <Input
                  type="text"
                  data-field="clearancecode"
                  onInput={(e) => handleInput(e)}
                  defaultValue={addressForm["identitycard"]}
                  className="form-input"
                  placeholder="Vui lòng nhập mã"
                />
              </div>
            </div>
          </div>
          <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zalonew.itaoth.com/assets/api/tel_phone.png" />
              </div>
              Mã vùng điện thoại
            </div>
            <div className="form-content">
              <div className="form-input">
                <Input
                  type="text"
                  data-field="telcode"
                  onInput={(e) => handleInput(e)}
                  defaultValue={addressForm["tel_code"]}
                  className="form-input"
                  placeholder="Vui lòng nhập mã vùng"
                />
              </div>
            </div>
          </div>
          <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img40.png" />
              </div>
              Quốc gia/Khu vực
            </div>
            <div className="form-content">
              <div
                className="form-picker"
                onClick={(e) => {
                  toTargetSelect(e, "/common/select/country");
                }}
              >
                <div className="form-picker-input">
                  {addressForm["country"]
                    ? addressForm["country"]
                    : "Vui lòng chọn quốc gia"}
                </div>
                <div className="form-icon"></div>
              </div>
            </div>
          </div>
          <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zalonew.itaoth.com/assets/api/maitou.png" />
              </div>
              Chọn nhãn mác
            </div>
            <div className="form-content">
              <div
                className="form-picker"
                onClick={(e) => {
                  toTargetSelect(e, "/common/select/maitou");
                }}
              >
                <div className="form-picker-input"></div>
                <div className="form-icon"></div>
              </div>
            </div>
          </div>
          <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" />
              </div>
              ​​Thông tin địa chỉ​​
            </div>
            <div className="form-content">
              <div className="form-picker">
                <div
                  className="form-picker-input"
                  onClick={() => {
                    setaddressPicker(true);
                  }}
                >
                  ​​{form["region"] || "Chọn Tỉnh/Thành phố, Quận/Huyện"}
                </div>
                <div className="form-icon"></div>
              </div>
            </div>
          </div>
          {/* <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" />
              </div>
              Thành phố
            </div>
            <div className="form-content">
              <div className="form-input">
                <Input
                  type="text"
                  data-field="userchengshi"
                  onInput={(e) => handleInput(e)}
                  defaultValue={addressForm["city"]}
                  className="form-input"
                  placeholder="Vui lòng nhập thành phố"
                />
              </div>
            </div>
          </div>
          <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" />
              </div>
              Quận/Huyện
            </div>
            <div className="form-content">
              <div className="form-input">
                <Input
                  type="text"
                  data-field="userregion"
                  onInput={(e) => handleInput(e)}
                  defaultValue={addressForm["region"]}
                  className="form-input"
                  placeholder="Vui lòng nhập quận/huyện"
                />
              </div>
            </div>
          </div>
          <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" />
              </div>
              Đường
            </div>
            <div className="form-content">
              <div className="form-input">
                <Input
                  type="text"
                  data-field="userstree"
                  onInput={(e) => handleInput(e)}
                  defaultValue={addressForm["street"]}
                  className="form-input"
                  placeholder="Vui lòng nhập tên đường"
                />
              </div>
            </div>
          </div>
          <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" />
              </div>
              Làng/Xã
            </div>
            <div className="form-content">
              <div className="form-input">
                <Input
                  type="text"
                  data-field="uservillages"
                  onInput={(e) => handleInput(e)}
                  defaultValue={addressForm["villages"]}
                  className="form-input"
                  placeholder="Vui lòng nhập làng/xã"
                />
              </div>
            </div>
          </div> */}
          <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" />
              </div>
              Số nhà
            </div>
            <div className="form-content">
              <div className="form-input">
                <Input
                  type="text"
                  data-field="userdoor"
                  onInput={(e) => handleInput(e)}
                  defaultValue={addressForm["door"]}
                  className="form-input"
                  placeholder="Vui lòng nhập số nhà"
                />
              </div>
            </div>
          </div>
          <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" />
              </div>
              Mã bưu điện
            </div>
            <div className="form-content">
              <div className="form-input">
                <Input
                  type="text"
                  data-field="usercode"
                  onInput={(e) => handleInput(e)}
                  defaultValue={addressForm["code"]}
                  className="form-input"
                  placeholder="Vui lòng nhập mã bưu điện"
                />
              </div>
            </div>
          </div>
          <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" />
              </div>
              Email
            </div>
            <div className="form-content">
              <div className="form-input">
                <Input
                  type="text"
                  data-field="useremils"
                  onInput={(e) => handleInput(e)}
                  defaultValue={addressForm["email"]}
                  className="form-input"
                  placeholder="Vui lòng nhập email"
                />
              </div>
            </div>
          </div>
          <div className="form-group" style={{ height: 150 + "px" }}>
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img41.png" />
              </div>
              Chi tiết địa chỉ
            </div>
            <div className="form-content">
              <Input.TextArea
                className="form-textarea"
                data-field="detail"
                onInput={(e) => handleInput(e)}
                defaultValue={addressForm["detail"]}
                style={{
                  width: 90 + "%",
                  height: 100 + "px",
                  margin: "0 auto",
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="button">
        <Button className="btn" onClick={(e) => handleSubmit(e)}>
          Lưu
        </Button>
      </div>
      <Loading is={loading} text={loadingText} />
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
