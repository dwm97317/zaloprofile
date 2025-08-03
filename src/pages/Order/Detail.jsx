import React, { useEffect } from "react";
import { Page } from "zmp-ui";
import { useRecoilValue } from "recoil";
import { packageInfoState, userState } from "../../state";
import "./Index.scss";
import util from "../../utils/util";
import Header from "../../components/Header/Header";

const PackDetailPage = () => {
  const user = useRecoilValue(userState);
  const pack_info = useRecoilValue(packageInfoState);

  useEffect(() => {
    util.setBarPageView("Chi tiết gói hàng");
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
            <div className="form-picker">
              <div className="form-picker-input">
                {pack_info["country"] ? pack_info["country"] : ""}
              </div>
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
                <div className="form-picker-input">
                  {pack_info["storage"]
                    ? pack_info["storage"]["shop_name"]
                    : "Vui lòng chọn quốc gia gửi hàng"}
                </div>
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
            <div className="form-content">
              <div className="form-picker">
                <div className="form-picker-input">
                  {pack_info["express_num"] ? pack_info["express_num"] : ""}
                </div>
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
              <div className="form-picker-input">
                {pack_info["class_name"]
                  ? pack_info["class_name"]
                  : "Vui lòng chọn loại hàng"}
              </div>
            </div>
          </div>
        </div>
        <div className="form-group flex">
          <div className="form-label">
            <div className="form-label-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" />
            </div>
            Giá trị hàng hóa (￥)
          </div>
          <div className="form-content">
            <div className="form-picker">
              <div className="form-picker-input">
                {pack_info["price"] ? pack_info["price"] : ""}
              </div>
            </div>
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
            <div className="form-picker-input">
              {pack_info["usermark"] ? pack_info["usermark"] : ""}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};
export default PackDetailPage;