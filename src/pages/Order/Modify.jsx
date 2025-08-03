import React, { useEffect, useState } from "react";
import { Page, useNavigate, Picker, Input, Button } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  packageInfoState,
  countryState,
  categoryState,
  userState,
} from "../../state";
import request from "../../utils/request";
import Loading from "../../components/Loading/Index";
import Header from "../../components/Header/Header";
import "./Index.scss";
import { showToast } from "zmp-sdk";
import util from "../../utils/util";

const ModifyPage = () => {
  const user = useRecoilValue(userState);
  const setCountryData = useSetRecoilState(countryState);
  const setCategoryData = useSetRecoilState(categoryState);
  const pack_info = useRecoilValue(packageInfoState);
  const [storage, setStorage] = useState([]); // Kho hàng
  const country = useRecoilValue(countryState);
  const category = useRecoilValue(categoryState);
  const navigate = useNavigate();
  const [form, setForm] = useState([]);
  const [formData, setFormData] = useState([]); // Dữ liệu biểu mẫu
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

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

  // Chuyển đến trang chọn
  const toTargetSelect = (e, path) => {
    navigate(path);
  };
  
  // Xử lý sự kiện nhập liệu
  const handleInput = (e) => {
    const field = e.target.dataset.field;
    form[field] = e.target.value;
  };

  // Danh sách loại hàng
  const handlePicker = (e) => {
    if (e.option) {
      form["storage_id"] = e.option["value"];
      setForm(form);
    }
  };

  // Gửi cập nhật dự báo
  const formSubmit = () => {
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
    form["express_id"] = 10577;
    form["id"] = pack_info["id"];
    setLoading(true);
    setLoadingText("Vui lòng đợi");
    request
      .post("package/packageUpdate&wxapp_id=10001", { ...form })
      .then((res) => {
        setLoading(false);
        setLoadingText("");
        if (res.code == 1) {
          showToast({
            message: "Cập nhật dự báo thành công",
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
    console.log("Mô phỏng componentDidMount lần render đầu tiên");
    console.log(pack_info, "pk_info");
    if (pack_info) {
      let _form = [];
      let { express_num, country_id, storage_id, remark } = pack_info;
      _form["express_sn"] = express_num;
      _form["country_id"] = country_id;
      _form["storage_id"] = storage_id;
      _form["remark"] = remark;
      setForm(_form);
    }
    util.setBarPageView("Chỉnh sửa gói hàng");
    getStorageList();
    if (country) {
      form["country_id"] = country["id"];
      formData["country"] = country["title"];
      setForm(form);
      setFormData(formData);
      setCountryData("");
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
    }
    return () => {
      console.log("Mô phỏng componentWillUnmount thực thi sau khi hủy");
    };
  }, []);
  
  return (
    <Page className="page report">
      <Header></Header>
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
                {pack_info["country"]
                  ? pack_info["country"]["title"]
                  : "Vui lòng chọn quốc gia gửi hàng"}
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
                  {pack_info["storage"]["shop_name"]}
                </div>
                <Picker
                  mask
                  maskClosable
                  inputClass="picker"
                  placeholder={
                    pack_info["storage"]["shop_name"] ? "" : "Chọn kho hàng"
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
                defaultValue={
                  pack_info["express_num"] ? pack_info["express_num"] : ""
                }
                className="form-input"
                placeholder="Vui lòng nhập số vận đơn"
              />
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
                {pack_info["class_name"]
                  ? pack_info["class_name"]
                  : "Vui lòng chọn loại hàng"}
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
              defaultValue={pack_info["price"] ? pack_info["price"] : ""}
              className="form-input"
              placeholder="Vui lòng nhập giá trị hàng hóa"
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
              defaultValue={pack_info["usermark"]}
            />
          </div>
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
export default ModifyPage;