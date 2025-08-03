import React, { useEffect, useState } from "react";
import { Button, Input, Page, useNavigate } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { categoryState, takeFormState, userState } from "../../state";
import request from "../../utils/request";
import Loading from "../../components/Loading/Index";
import "./Index.scss";
import { showToast } from "zmp-sdk";
import util from "../../utils/util";

const PackTakePage = () => {
  const setCategoryData = useSetRecoilState(categoryState);
  const setTakeForm = useSetRecoilState(takeFormState);
  const user = useRecoilValue(userState);
  const category = useRecoilValue(categoryState);
  const takeform = useRecoilValue(takeFormState);
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [form, setForm] = useState([]);
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  // Xử lý sự kiện nhập liệu
  const handleInput = (e) => {
    const field = e.target.dataset.field;
    form[field] = e.target.value;
    setTakeForm({ ...form, ...formData });
  };

  // Chuyển đến màn hình chọn
  const toTargetSelect = (e, path) => {
    navigate(path);
  };

  // Gửi yêu cầu nhận kiện
  const formSubmit = () => {
    if (!form["express_sn"]) {
      showToast({
        message: "Vui lòng nhập số vận đơn",
      });
      return;
    }
    if (!form["class_ids"]) {
      showToast({
        message: "Vui lòng chọn loại hàng hóa",
      });
      return;
    }
    setLoading(true);
    setLoadingText("Vui lòng đợi");
    request
      .post("package/getTakePackage&wxapp_id=10001", { ...form })
      .then((res) => {
        setLoading(false);
        setLoadingText("");
        if (res.code == 1) {
          showToast({
            message: "Nhận kiện hàng thành công",
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
    util.setBarPageView("Nhận gói hàng");
    if (takeform) {
      form["express_sn"] = takeform["express_sn"];
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
      setFormData(formData);
      setCategoryData("");
      setTakeForm({ ...form, ...formData });
    }
    return () => {
      console.log("Mô phỏng componentWillUnmount thực thi sau khi hủy");
    };
  }, []);
  
  return (
    <Page className="page report">
      <div className="form">
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
                defaultValue={takeform["express_sn"]}
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
                {formData["class"] ? (
                  formData["class"]
                ) : (
                  <span className="default-value">Vui lòng chọn loại hàng</span>
                )}
              </div>
              <div className="form-icon"></div>
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
export default PackTakePage;