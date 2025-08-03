import React, { useEffect, useState } from "react";
import { Page, useNavigate, Tabs, Input, Picker, Button } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  categoryState,
  countryState,
  reportFormGoodsItemState,
  reportFormState,
  reportFormTypeState,
} from "../../state";
import request from "../../utils/request";
import Loading from "../../components/Loading/Index";
import Header from "../../components/Header/Header";
import "./Index.scss";
import { showToast } from "zmp-sdk";
import util from "../../utils/util";

const PackReportPage = () => {
  const setCountryData = useSetRecoilState(countryState);
  const setCategoryData = useSetRecoilState(categoryState);
  const setFormReportData = useSetRecoilState(reportFormState);
  const setFormReportType = useSetRecoilState(reportFormTypeState);
  const setFormReportGoodsItemData = useSetRecoilState(
    reportFormGoodsItemState,
  );
  const navigate = useNavigate();
  const country = useRecoilValue(countryState);
  const category = useRecoilValue(categoryState);
  const formReport = useRecoilValue(reportFormState);
  const formReportType = useRecoilValue(reportFormTypeState);
  const formReportGoodsItem = useRecoilValue(reportFormGoodsItemState);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [storage, setStorage] = useState([]); // Kho hàng
  const [form, setForm] = useState({}); // Dữ liệu biểu mẫu
  const [formData, setFormData] = useState([]); // Dữ liệu biểu mẫu
  const [express, setExpress] = useState(""); // Dữ liệu biểu mẫu
  let [formGoodsItem, setFormGoodsItem] = useState([{}]);
  let [privacy, setPrivacy] = useState(false);

  // Danh sách kho hàng
  const getStorageList = () => {
    request.get("/package/storage&wxapp_id=10001").then((res) => {
      let _storage = [];
      for (let i in res.data) {
        _storage.push({
          value: res.data[i]["shop_id"],
          displayName: res.data[i]["shop_name"],
        });
      }
      setStorage(_storage);
    });
  };

  // Xử lý chọn kho hàng
  const handlePicker = (e) => {
    if (e.option) {
      form["storage_id"] = e.option["value"];
      formData["storeName"] = e.option["displayName"];
      setForm(form);
      setFormData(formData);
      setFormReportData({ ...form, ...formData });
    }
  };

  // Chuyển đến trang chọn
  const toTargetSelect = (e, path) => {
    navigate(path);
  };

  // Xử lý sự kiện nhập liệu
  const handleInput = (e) => {
    const field = e.target.dataset.field;
    form[field] = e.target.value;
    setForm(form);
    setFormReportData({ ...form, ...formData });
  };

  // Xử lý nhập liệu cho mục hàng hóa
  const handleGoodsItemInput = (e, index) => {
    let field = e.target.dataset.field;
    let _item = {};
    if (!util.isEmpty(formGoodsItem[index])) {
      _item = { ...formGoodsItem[index] };
    }
    _item[field] = e.target.value;
    formGoodsItem[index] = _item;
    setFormGoodsItem(formGoodsItem);
    setFormReportGoodsItemData([...formGoodsItem]);
  };

  // Nhập số vận đơn
  const handleInputExpress = (e) => {
    setExpress(e.target.value);
  };

  // Thêm số vận đơn
  const handleAddExpress = (e) => {
    if (express == "") return;
    if (form["express_sn"]) {
      form["express_sn"] = form["express_sn"] + "," + express;
    } else {
      form["express_sn"] = express;
    }
    setExpress("");
    setFormReportData({ ...form, ...formData });
  };

  // Thêm mục hàng hóa
  const addGoodsItem = (e) => {
    formGoodsItem.push({});
    setFormGoodsItem([...formGoodsItem]);
  };

  // Xóa mục hàng hóa
  const deleteGoodsItem = (e, index) => {
    formGoodsItem.splice(index, 1);
    if (index == 0) return false;
    setFormGoodsItem([...formGoodsItem]);
    setFormReportData({ ...form, ...formData });
    setFormReportGoodsItemData([...formGoodsItem]);
  };

  // Khởi tạo dữ liệu
  const getInitData = () => {
    if (formReport) {
      formData["storeName"] = formReport["storeName"];
      formData["country"] = formReport["country"];
      formData["class"] = formReport["class"];
      formData["express_sn"] = formReport["express_sn"];
      form["storage_id"] = formReport["storage_id"];
      form["country_id"] = formReport["country_id"];
      form["express_sn"] = formReport["express_sn"];
      setForm(form);
      setFormData(formData);
    }
    if (formReportGoodsItem) {
      setFormGoodsItem(formReportGoodsItem);
    }
    getStorageList();
  };

  const handleTabClick = (e) => {
    setFormReportType(e);
  };

  // Đặt chấp nhận chính sách bảo mật
  const setPrivacys = (e) => {
    privacy = privacy == false ? true : false;
    setPrivacy(privacy);
  };

  // Gửi dự báo
  const formSubmit = () => {
    if (privacy == false) {
      showToast({
        message: "Vui lòng đồng ý với chính sách bảo mật trước",
      });
      return;
    }
    if (!form["country_id"]) {
      showToast({
        message: "Vui lòng chọn quốc gia gửi hàng",
      });
      return;
    }
    if (!form["storage_id"]) {
      showToast({
        message: "Vui lòng chọn kho hàng",
      });
      return;
    }
    if (!form["express_sn"]) {
      showToast({
        message: "Vui lòng nhập số vận đơn",
      });
      return;
    }
    form["express_id"] = 10577;
    form["goodslist"] = formGoodsItem;
    setLoading(true);
    setLoadingText("Vui lòng đợi");
    let urls = {
      normal: "package/report&wxapp_id=10001",
      batch: "/package/reportBatch&wxapp_id=10001",
    };
    request.post(urls[formReportType], { ...form }).then((res) => {
      setLoading(false);
      setLoadingText("");
      setFormReportType("normal");
      if (res.code == 1) {
        showToast({
          message: "Dự báo thành công",
        });
        return;
      } else {
        showToast({
          message: res.msg,
        });
        return;
      }
    });
  };
  
  useEffect(() => {
    util.setBarPageView("Dự báo gói hàng");
    util.checkLogin().then((res) => {
      if (!res) {
        navigate("/mine");
      }
    });
    getInitData();
    if (country) {
      form["country_id"] = country["id"];
      formData["country"] = country["title"];
      setForm(form);
      setFormData(formData);
      setCountryData("");
      setFormReportData({ ...form, ...formData });
    }
    if (category) {
      let category_name = "";
      let class_ids = [];
      category.forEach((item, index) => {
        category_name += item["name"] + ",";
        class_ids.push(item["category_id"]);
      });
      formData["class"] = category_name;
      form["class_ids"] = class_ids.join(",");
      setForm(form);
      setCategoryData("");
      setFormReportData({ ...form, ...formData });
    }
    return () => {};
  }, []);

  return (
    <Page className="page report">
      <Header></Header>
      <div className="report-pages">
        <div className="pages-table">
          <Tabs
            id="contact-list"
            defaultActiveKey={formReportType}
            onTabClick={(e) => {
              handleTabClick(e);
            }}
          >
            <Tabs.Tab key="normal" label="Dự báo đơn vận chuyển">
              <div className="form">
                <div className="form-group flex">
                  <div className="form-label">
                    <div className="form-label-icon">
                      <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" />
                    </div>
                    Quốc gia gửi hàng
                  </div>
                  <div className="form-content">
                    <div
                      className="form-picker"
                      onClick={(e) => {
                        toTargetSelect(e, "/common/select/country");
                      }}
                    >
                      <div className="form-picker-input">
                        {formData["country"] ? (
                          formData["country"]
                        ) : (
                          <span className="default-value">Chọn quốc gia gửi hàng</span>
                        )}
                      </div>
                      <div className="form-icon"></div>
                    </div>
                  </div>
                </div>
                <div className="form-group flex">
                  <div className="form-label">
                    <div className="form-label-icon">
                      <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img26.png" />
                    </div>
                    Kho tập kết
                  </div>
                  <div className="form-content">
                    <div className="form-content">
                      <div className="form-picker">
                        <div className="picker-default-value">
                          {formReport["storeName"]}
                        </div>
                        <Picker
                          mask
                          maskClosable
                          inputClass="picker"
                          placeholder={
                            formReport["storeName"] ? "" : "Chọn kho hàng"
                          }
                          onChange={(e) => handlePicker(e)}
                          action={{
                            text: "Xác nhận",
                            close: true,
                          }}
                          data={[
                            {
                              options: storage,
                              name: "option",
                            },
                          ]}
                        />
                        <div className="form-icon"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="gap"></div>
                <div className="form-group flex">
                  <div className="form-label">
                    <div className="form-label-icon">
                      <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img40.png" />
                    </div>
                    Số vận đơn
                  </div>
                  <div className="form-content">
                    <div className="form-input">
                      <Input
                        type="text"
                        data-field="express_sn"
                        onInput={(e) => handleInput(e)}
                        defaultValue={formReport["express_sn"]}
                        className="form-input"
                        placeholder="Nhập số vận đơn"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group" style={{ height: "auto" }}>
                  <div className="form-label">
                    <div className="form-label-icon">
                      <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img41.png" />
                    </div>
                    Danh sách hàng hóa
                  </div>
                  <div className="form-content">
                    <div className="good-sheet">
                      <div className="good-sheet-header">
                        <div className="good-sheet-header-th">Tên hàng</div>
                        <div className="good-sheet-header-th">Đơn giá</div>
                        <div className="good-sheet-header-th">Số lượng</div>
                        <div className="good-sheet-header-th">Thao tác</div>
                      </div>
                      <div className="good-sheet-body">
                        {formGoodsItem.map((item, index) => {
                          return (
                            <div className="good-sheet-item" key={index}>
                              <div className="good-sheet-td">
                                <Input
                                  className="good-inp"
                                  data-field="pinming"
                                  defaultValue={
                                    formReportGoodsItem[index]
                                      ? formReportGoodsItem[index]["pinming"]
                                      : ""
                                  }
                                  onInput={(e) =>
                                    handleGoodsItemInput(e, index)
                                  }
                                />
                              </div>
                              <div className="good-sheet-td">
                                <Input
                                  className="good-inp"
                                  data-field="danjia"
                                  defaultValue={
                                    formReportGoodsItem[index]
                                      ? formReportGoodsItem[index]["danjia"]
                                      : ""
                                  }
                                  onInput={(e) =>
                                    handleGoodsItemInput(e, index)
                                  }
                                />
                              </div>
                              <div className="good-sheet-td">
                                <Input
                                  className="good-inp"
                                  data-field="shuliang"
                                  defaultValue={
                                    formReportGoodsItem[index]
                                      ? formReportGoodsItem[index]["shuliang"]
                                      : ""
                                  }
                                  onInput={(e) =>
                                    handleGoodsItemInput(e, index)
                                  }
                                />
                              </div>
                              <div className="good-sheet-td">
                                <div className="op">
                                  <div
                                    className="op-btn"
                                    onClick={(e) => {
                                      deleteGoodsItem(e, index);
                                    }}
                                  >
                                    -
                                  </div>
                                  <div
                                    className="op-btn"
                                    onClick={(e) => {
                                      addGoodsItem();
                                    }}
                                  >
                                    +
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-group flex">
                  <div className="form-label">
                    <div className="form-label-icon">
                      <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" />
                    </div>
                    Loại hàng hóa
                  </div>
                  <div className="form-content">
                    <div className="form-picker">
                      <div
                        className="form-picker-input"
                        onClick={(e) => {
                          toTargetSelect(e, "/common/select/category");
                        }}
                      >
                        {formData["class"] ? (
                          formData["class"]
                        ) : (
                          <span className="default-value">Chọn loại hàng hóa</span>
                        )}
                      </div>
                      <div className="form-icon"></div>
                    </div>
                  </div>
                </div>
                <div className="form-group flex">
                  <div className="form-label">
                    <div className="form-label-icon">
                      <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" />
                    </div>
                    Giá trị hàng hóa(￥)
                  </div>
                  <div className="form-content">
                    <Input
                      type="text"
                      data-field="price"
                      onInput={(e) => handleInput(e)}
                      defaultValue={formReport["price"]}
                      className="form-input"
                      placeholder="Nhập giá trị hàng hóa"
                    />
                  </div>
                </div>
                <div className="form-group" style={{ height: 150 + "px" }}>
                  <div className="form-label">
                    <div className="form-label-icon">
                      <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img41.png" />
                    </div>
                    Ghi chú hàng hóa
                  </div>
                  <div className="form-content">
                    <Input.TextArea
                      className="form-textarea"
                      data-field="remark"
                      onInput={(e) => handleInput(e)}
                      defaultValue={formReport["remark"]}
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
            </Tabs.Tab>
            <Tabs.Tab key="batch" label="Dự báo nhiều vận đơn">
              <div className="form">
                <div className="form-group flex">
                  <div className="form-label">
                    <div className="form-label-icon">
                      <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" />
                    </div>
                    Quốc gia gửi hàng
                  </div>
                  <div className="form-content">
                    <div
                      className="form-picker"
                      onClick={(e) => {
                        toTargetSelect(e, "/common/select/country");
                      }}
                    >
                      <div className="form-picker-input">
                        {formData["country"] ? (
                          formData["country"]
                        ) : (
                          <span className="default-value">Chọn quốc gia gửi hàng</span>
                        )}
                      </div>
                      <div className="form-icon"></div>
                    </div>
                  </div>
                </div>
                <div className="form-group flex">
                  <div className="form-label">
                    <div className="form-label-icon">
                      <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img26.png" />
                    </div>
                    Kho tập kết
                  </div>
                  <div className="form-content">
                    <div className="form-content">
                      <div className="form-picker">
                        <div className="picker-default-value">
                          {formReport["storeName"]}
                        </div>
                        <Picker
                          mask
                          maskClosable
                          inputClass="picker"
                          placeholder={
                            formReport["storeName"] ? "" : "Chọn kho hàng"
                          }
                          onChange={(e) => handlePicker(e)}
                          action={{
                            text: "Xác nhận",
                            close: true,
                          }}
                          data={[
                            {
                              options: storage,
                              name: "option",
                            },
                          ]}
                        />
                        <div className="form-icon"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="gap"></div>
                <div className="form-group flex">
                  <div className="form-label">
                    <div className="form-label-icon">
                      <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img40.png" />
                    </div>
                    Số vận đơn
                  </div>
                  <div className="form-content">
                    <div className="form-input">
                      <input
                        className="form-input mulit-input"
                        value={express}
                        onInput={(e) => {
                          handleInputExpress(e);
                        }}
                        placeholder="Nhập số vận đơn"
                      />
                      <div
                        className="form-add1"
                        onClick={(e) => {
                          handleAddExpress(e);
                        }}
                      >
                        +
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-group" style={{ height: 250 + "px" }}>
                  <div className="form-label" style={{ width: 100 + "%" }}>
                    <div className="form-label-icon">
                      <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img40.png" />
                    </div>
                    Nhiều số vận đơn (phân cách bằng dấu phẩy)
                  </div>
                  <div className="form-content form-mulit-express">
                    <textarea
                      className="form-textarea mulit-express"
                      data-field="express_sn"
                      value={form["express_sn"]}
                      onInput={(e) => handleInput(e)}
                    />
                    <div className="tips">
                      Lưu ý: Giữa hai số vận đơn phải dùng dấu phẩy phân cách, nếu không biết cách làm, vui lòng sử dụng [Số vận đơn] ở trên, nhập một số rồi nhấn dấu +
                    </div>
                  </div>
                </div>
                <div className="form-group flex">
                  <div className="form-label">
                    <div className="form-label-icon">
                      <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" />
                    </div>
                    Loại hàng hóa
                  </div>
                  <div className="form-content">
                    <div className="form-picker">
                      <div
                        className="form-picker-input"
                        onClick={(e) => {
                          toTargetSelect(e, "/common/select/category");
                        }}
                      >
                        {formData["class"] ? (
                          formData["class"]
                        ) : (
                          <span className="default-value">Chọn loại hàng hóa</span>
                        )}
                      </div>
                      <div className="form-icon"></div>
                    </div>
                  </div>
                </div>
                <div className="form-group flex">
                  <div className="form-label">
                    <div className="form-label-icon">
                      <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" />
                    </div>
                    Giá trị hàng hóa(￥)
                  </div>
                  <div className="form-content">
                    <Input
                      type="text"
                      className="form-input"
                      data-field="price"
                      onInput={(e) => handleInput(e)}
                      defaultValue={formReport["price"]}
                      placeholder="Nhập giá trị hàng hóa"
                    />
                  </div>
                </div>
                <div className="form-group" style={{ height: 150 + "px" }}>
                  <div className="form-label">
                    <div className="form-label-icon">
                      <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img41.png" />
                    </div>
                    Ghi chú hàng hóa
                  </div>
                  <div className="form-content">
                    <Input.TextArea
                      data-field="remark"
                      onInput={(e) => handleInput(e)}
                      defaultValue={formReport["remark"]}
                      className="form-textarea"
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
            </Tabs.Tab>
          </Tabs>
        </div>
      </div>
      <div className="button">
        <Button className="btn" onClick={(e) => formSubmit(e)}>
          Lưu
        </Button>
      </div>
      <Loading is={loading} text={loadingText} />
    </Page>
  );
};
export default PackReportPage;