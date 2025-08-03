import React, { useEffect, useState } from "react";
import { Page, useNavigate, Input, Picker, Button } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { queryFormState, countryState, categoryState } from "../../state";
import Header from "../../components/Header/Header";
import Tab from "../../components/Tab/Tab";
import "./Index.scss";
import util from "../../utils/util";

const FreightPage = () => {
  const country = useRecoilValue(countryState);
  const category = useRecoilValue(categoryState);
  const setCountryData = useSetRecoilState(countryState);
  const setCategoryData = useSetRecoilState(categoryState);
  const setFormQueryData = useSetRecoilState(queryFormState);
  const navigate = useNavigate();
  const formQuery = useRecoilValue(queryFormState);
  const [form, setForm] = useState({ freeType: 1 }); // Dữ liệu biểu mẫu
  const [formData, setFormData] = useState([]);

  const UnitWeightForm = () => {
    return (
      <div>
        <div className="form-group flex">
          <div className="form-label">
            <div className="form-label-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img40.png" />
            </div>
            Khối lượng (kg)
          </div>
          <div className="form-content">
            <div className="form-input">
              <Input
                type="text"
                className="form-input"
                data-field="weight"
                defaultValue={formQuery["weight"]}
                onBlur={(e) => handleBlur(e)}
                onChange={(e) => handleInput(e)}
                placeholder="Nhập khối lượng kiện hàng"
              />
            </div>
          </div>
        </div>
        <div className="gap"></div>
        <div className="form-group" style={{ height: 100 + "px" }}>
          <div className="form-label">
            <div className="form-label-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img41.png" />
            </div>
            Kích thước hàng hóa
          </div>
          <div className="form-content">
            <div className="form-input-group ">
              <div className="form-input-item">
                <Input
                  placeholder="Dài(cm)"
                  data-field="length"
                  defaultValue={formQuery["length"] || ""}
                  onBlur={(e) => handleBlur(e)}
                  onInput={(e) => handleInput(e)}
                />
              </div>
              <div className="form-input-item">
                <Input
                  placeholder="Rộng(cm)"
                  data-field="width"
                  defaultValue={formQuery["width"] || ""}
                  onBlur={(e) => handleBlur(e)}
                  onInput={(e) => handleInput(e)}
                />
              </div>
              <div className="form-input-item">
                <Input
                  placeholder="Cao(cm)"
                  data-field="height"
                  defaultValue={formQuery["height"] || ""}
                  onBlur={(e) => handleBlur(e)}
                  onInput={(e) => handleInput(e)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const UnitForm = () => {
    return (
      <div>
        <div className="form-group flex">
          <div className="form-label">
            <div className="form-label-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img40.png" />
            </div>
            Khối lượng (CBM)
          </div>
          <div className="form-content">
            <div className="form-input">
              <Input
                type="text"
                className="form-input"
                placeholder="Nhập khối lượng kiện hàng"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handlePicker = (e) => {
    if (e.option) {
      form["freeType"] = e.option["value"];
      formData["unitName"] = e.option["displayName"];
      setForm(form);
      setFormData(formData);
      setFormQueryData({ ...form, ...formData });
    }
  };

  const handleBlur = () => {
    setFormQueryData({ ...form, ...formData });
  };

  // Xử lý sự kiện nhập liệu
  const handleInput = (e) => {
    const field = e.target.dataset.field;
    form[field] = e.target.value;
  };

  // Khởi tạo dữ liệu
  const getInitData = () => {
    if (formQuery) {
      console.log(formQuery, "fm");
      formData["country"] = formQuery["country"];
      formData["class"] = formQuery["class"];
      form["freeType"] = formQuery["freeType"];
      form["country_id"] = formQuery["country_id"];
      form["length"] = formQuery["length"];
      form["class_ids"] = formQuery["class_ids"];
      form["width"] = formQuery["width"];
      form["height"] = formQuery["height"];
      form["weight"] = formQuery["weight"];
      formData["unitName"] = formQuery["unitName"];
      setForm(form);
      setFormData(formData);
    }
  };
  
  // Chuyển đến trang chọn
  const toTargetSelect = (e, path) => {
    navigate(path);
  };

  const handleSubmit = () => {
    navigate("/freight/result");
  };

  useEffect(() => {
    util.setBarPageView("Tính cước vận chuyển");
    getInitData();
    if (country) {
      form["country_id"] = country["id"];
      formData["country"] = country["title"];
      setForm(form);
      setFormData(formData);
      setCountryData("");
      setFormQueryData({ ...form, ...formData });
    }
    if (category) {
      console.log("Chọn danh mục");
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
      console.log({ ...form, ...formData }, "saveFormQuery");
      setFormQueryData({ ...form, ...formData });
    }
  }, []);
  
  return (
    <Page className="page freight">
      <Header></Header>
      <div className="freight-box">
        <div className="tips">Lưu ý: Khối lượng có thể tăng khi đóng gói, khối lượng thực tế sẽ được tính khi xuất kho</div>
        <div className="form">
          <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" />
              </div>
              Khu vực nhận hàng
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
                    <span className="default-value">Chọn quốc gia nhận hàng</span>
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
              Đơn vị tính
            </div>
            <div className="form-content">
              <div className="form-content">
                <div className="form-picker">
                  <div className="picker-default-value">
                    {formData["unitName"]}
                  </div>
                  <Picker
                    mask
                    maskClosable
                    inputClass="picker"
                    placeholder={formData["unitName"] ? "" : "Chọn quy tắc tính cước"}
                    onChange={(e) => handlePicker(e)}
                    action={{
                      text: "Đóng",
                      close: true,
                    }}
                    data={[
                      {
                        options: [
                          { value: 1, displayName: "Khối lượng" },
                          { value: 2, displayName: "Thể tích" },
                        ],
                        name: "option",
                      },
                    ]}
                  />
                  <div className="form-icon"></div>
                </div>
              </div>
            </div>
          </div>
          {form["freeType"] == 1 ? <UnitWeightForm /> : <UnitForm />}
          <div className="form-group flex">
            <div className="form-label">
              <div className="form-label-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img28.png" />
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
          <div
            className="form-group flex"
            style={{ height: 100 + "px", justifyContent: "center" }}
          >
            <Button
              style={{ width: 90 + "%", marginTop: 20 + "px" }}
              onClick={(e) => handleSubmit()}
            >
              Tra cứu ngay
            </Button>
          </div>
        </div>
      </div>
      <Tab current="freight" />
    </Page>
  );
};

export default FreightPage;