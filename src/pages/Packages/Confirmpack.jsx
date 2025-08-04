import React, { useEffect, useState } from "react";
import { Button, Picker, Page, Input, useNavigate } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { addressInfoState, packInfoState, selectState } from "../../state";
import request from "../../utils/request";
import Loading from "../../components/Loading/Index";
import Header from "../../components/Header/Header";
import "./Index.scss";
import { showToast } from "zmp-sdk";
import util from "../../utils/util";

const PackConfirmPage = () => {
  const setSelect = useSetRecoilState(selectState);
  const setAddressInfo = useSetRecoilState(addressInfoState);
  const packInfos = useRecoilValue(packInfoState);
  const address = useRecoilValue(addressInfoState);
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [packservice, setPackService] = useState([]);
  const [channel, setChannel] = useState([]);
  const [form, setForm] = useState([]);
  const [tab, setTab] = useState(1);
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  let [privacy, setPrivacy] = useState(false);

  // Lấy danh sách kênh xuất hàng
  const getChannelList = () => {
    const url = "package/lineplus";
    request
      .get(url + "&wxapp_id=10001", { address_id: form["address_id"] })
      .then((res) => {
        const list = res.data.data;
        let channel = [];
        list.map((item, index) => {
          channel.push({
            value: item["id"],
            displayName: item["name"],
          });
        });
        setChannel(channel);
      });
  };

  // Lấy dịch vụ gia tăng
  const getPackServiceList = () => {
    const url = "/package/postservice";
    request.get(url + "&wxapp_id=10001").then((res) => {
      const packservice = res.data;
      setPackService(packservice);
    });
  };
  
  // Lấy danh sách địa chỉ
  const getAddressSList = () => {
    const url = "/address/lists";
    request.get(url + "&wxapp_id=10001").then((res) => {
      const list = res.data.list;
      if (res.code == 1) {
        form["address_id"] = list[0]["address_id"];
        formData["address"] = list[0];
        setFormData(formData);
        getChannelList();
      }
    });
  };

  const handlePicker = (e) => {
    if (e.option) {
      form["line_id"] = e.option["value"];
      setForm(form);
    }
  };
  
  // Xử lý sự kiện nhập liệu
  const handleInput = (e) => {
    const field = e.target.dataset.field;
    form[field] = e.target.value;
  };

  // Đặt chấp nhận chính sách bảo mật
  const setPrivacys = (e) => {
    privacy = privacy == false ? true : false;
    setPrivacy(privacy);
  };
  
  // Lấy ID đã chọn
  const getSelectIds = () => {
    let ids = [];
    packservice.map((item, index) => {
      if (item["is_select"]) {
        ids.push(item["id"]);
      }
    });
    return ids;
  };

  const toSelectAddress = () => {
    setSelect(true);
    navigate("/address/index");
  };

  const handleSelect = (index) => {
    let _data = packservice[index];
    if (_data["is_select"]) {
      _data["is_select"] = false;
    } else {
      _data["is_select"] = true;
    }
    packservice[index] = _data;
    setPackService([...packservice]);
  };

  // Gửi xác nhận đóng gói
  const formSubmit = () => {
    let service = getSelectIds();
    if (privacy == false) {
      showToast({
        message: "Vui lòng đồng ý với chính sách bảo mật trước",
      });
      return;
    }
    if (!form["line_id"]) {
      showToast({
        message: "Vui lòng chọn kênh xuất hàng",
      });
      return;
    }

    // 修复：将数组转换为字符串格式，符合后端 API 期望
    const submitData = {
      ...form,
      pack_ids: Array.isArray(service) ? service.join(',') : service,
      packids: Array.isArray(form["packids"]) ? form["packids"].join(',') : form["packids"]
    };

    console.log("提交打包数据:", submitData);

    setLoading(true);
    setLoadingText("Vui lòng đợi");
    request.post("package/postpack&wxapp_id=10001", submitData).then((res) => {
      setLoading(false);
      setLoadingText("");
      console.log("打包响应:", res);
      if (res.code == 1) {
        showToast({
          message: "Đóng gói thành công",
        });
        // 成功后跳转到包裹列表页面
        setTimeout(() => {
          navigate("/package");
        }, 1500);
        return;
      } else {
        showToast({
          message: res.msg || "Đóng gói thất bại, vui lòng thử lại",
        });
        return;
      }
    }).catch((error) => {
      setLoading(false);
      setLoadingText("");
      console.error("打包请求失败:", error);
      showToast({
        message: "Lỗi kết nối, vui lòng thử lại",
      });
    });
  };

  useEffect(() => {
    getPackServiceList();
    getChannelList();
    if (address) {
      form["address_id"] = address["address_id"];
      formData["address"] = address;
      setFormData(formData);
      setAddressInfo();
    } else {
      getAddressSList();
    }
    util.setBarPageView("Xác nhận đóng gói");
    // 修复：确保 packids 是字符串格式
    form["packids"] = Array.isArray(packInfos["ids"]) ? packInfos["ids"].join(',') : packInfos["ids"];
    console.log("初始化包裹信息:", { packInfos, packids: form["packids"] });
    return () => {};
  }, []);
  
  return (
    <Page className="page package">
      <Header></Header>
      <div className="tab">
        <div
          className={`pack-tab-item ${tab == 1 ? "active" : ""}`}
          onClick={(e) => setTab(1)}
        >
          Giao hàng tận nơi
        </div>
        <div
          className={`pack-tab-item ${tab == 2 ? "active" : ""}`}
          onClick={(e) => setTab(2)}
        >
          Tự đến lấy
        </div>
      </div>
      <div className="address-wrap">
        <div className="address">
          <div className="address-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img164.png" />
          </div>
          <div className="address-info">
            <p className="address-name">
              {formData["address"]
                ? formData["address"]["name"] + formData["address"]["phone"]
                : ""}
            </p>
            <p>
              {formData["address"]
                ? formData["address"]["province"] +
                  formData["address"]["city"] +
                  formData["address"]["street"] +
                  formData["address"]["detail"]
                : ""}
            </p>
          </div>
          <div className="address-btn" onClick={(e) => toSelectAddress(e)}>
            Thay đổi
          </div>
        </div>
      </div>
      <div className="pack-info report">
        <div className="pack-label">Tổng đóng gói</div>
        <div className="pack-content">
          <p>{packInfos["num"] ? packInfos["num"] : 0} kiện, 10kg</p>
          <div className="form">
            <div className="form-group flex">
              <div className="form-label">
                <div className="form-label-icon">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img26.png" />
                </div>
                Kênh xuất hàng
              </div>
              <div className="form-content">
                <div className="form-content">
                  <div className="form-picker">
                    <Picker
                      mask
                      maskClosable
                      inputClass="picker"
                      placeholder="Chọn kênh"
                      onChange={(e) => handlePicker(e)}
                      action={{
                        text: "Đóng",
                        close: true,
                      }}
                      data={[
                        {
                          options: channel,
                          name: "option",
                        },
                      ]}
                    />
                    <div className="form-icon"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-group" style={{ height: "auto" }}>
              <div className="form-label">
                <div className="form-label-icon">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img26.png" />
                </div>
                Dịch vụ gia tăng
              </div>
              <div className="form-content">
                <div className="form-tips">
                  Vận chuyển không đảm bảo không vỡ, đề nghị chọn phương thức đóng gói phù hợp, có thể chọn nhiều, hàng cỡ đặc biệt lớn thương lượng riêng. Trọng lượng sau khi đóng gói có thể tăng, trọng lượng thực tế sẽ được tính khi xuất hàng!
                </div>
                <div className="form-check">
                  {packservice.map((item, index) => {
                    return (
                      <div
                        className="form-check-options"
                        key={index}
                        onClick={(e) => {
                          handleSelect(index);
                        }}
                      >
                        <div
                          className={`form-check-input ${
                            item["is_select"] ? "" : "no-check"
                          }`}
                        >
                          {item["is_select"] ? (
                            <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img36.png"></img>
                          ) : (
                            ""
                          )}
                        </div>
                        {item["name"]}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="form-group flex">
              <div className="form-label">
                <div className="form-label-icon">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img40.png" />
                </div>
                Tiền thu hộ
              </div>
              <div className="form-content">
                <div className="form-input">
                  <Input
                    type="text"
                    data-field="waitreceivedmoney"
                    onInput={(e) => handleInput(e)}
                    className="form-input"
                    placeholder="Vui lòng nhập tiền thu hộ"
                  />
                </div>
              </div>
            </div>
            <div className="form-group" style={{ height: 150 + "px" }}>
              <div className="form-label">
                <div className="form-label-icon">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img41.png" />
                </div>
                Thông tin ghi chú
              </div>
              <div className="form-content">
                <Input.TextArea
                  className="form-textarea"
                  data-field="remark"
                  onInput={(e) => handleInput(e)}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="protocol">
                <div
                  className="check-status"
                  onClick={(e) => {
                    setPrivacys();
                  }}
                >
                  <img
                    src={
                      privacy
                        ? "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img31.png"
                        : "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img32.png"
                    }
                  />
                </div>
                Đã xem và đồng ý (Chính sách bảo mật người dùng)
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="button">
        <Button className="btn" onClick={(e) => formSubmit(e)}>
          Xác nhận
        </Button>
      </div>
      <Loading is={loading} text={loadingText} />
    </Page>
  );
};
export default PackConfirmPage;