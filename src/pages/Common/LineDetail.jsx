import React, { useEffect, useState } from "react";
import { Button, Page, useNavigate } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { lineIdState, userState } from "../../state";
import request from "../../utils/request";
import Header from "../../components/Header/Header";
import "./Index.scss";
import util from "../../utils/util";

const AddressPage = () => {
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const lineId = useRecoilValue(lineIdState);
  const [detail, setDetail] = useState({});
  const modelname = [
    "Tính phí theo bậc",
    "Tính phí theo trọng lượng đầu và tiếp theo",
    "Tính phí theo khoảng phạm vi",
    "Tính phí theo khoảng trọng lượng"
  ];
  
  // Lấy chi tiết tuyến đường
  const getDetailList = () => {
    const url = "page/lineDetails";
    request.get(url + "&wxapp_id=10001", { id: lineId }).then((res) => {
      const detail = res.data;
      setDetail(detail);
    });
  };

  const renderFreeMode = () => {
    if (detail["free_mode"] == 1 || detail["free_mode"] == 4) {
      return (
        <div className="calculate_fee">
          <div>Trọng lượng đầu: 1kg </div>
          <div>45￥/kg</div>
          <div>Trọng lượng tiếp theo: 3kg</div>
          <div>56￥/kg</div>
        </div>
      );
    } else if (detail["free_mode"] == 2) {
      return (
        <div>
          {detail.free_rule && detail.free_rule.map((item, index) => {
            return (
              <div className="calculate_fee" key={index}>
                <div>Trọng lượng đầu: {item["first_weight"]}kg </div>
                <div>{item["first_price"]}￥/kg</div>
                <div>Trọng lượng tiếp theo: {item["next_weight"]}kg</div>
                <div>{item["next_price"]}￥/kg</div>
              </div>
            );
          })}
        </div>
      );
    }
  };

  useEffect(() => {
    console.log("Mô phỏng componentDidMount lần render đầu tiên");
    getDetailList();
    util.setBarPageView("Chi tiết tuyến đường");
    return () => {
      console.log("Mô phỏng componentWillUnmount thực thi sau khi hủy");
    };
  }, []);
  
  return (
    <Page className="page common">
      <Header></Header>
      <div className="common-container">
        <div className="c-c-title">Thông tin gửi hàng</div>
        <div className="c-c-content">
          <p>
            Tên tuyến đường <span>{detail["name"]}</span>
          </p>
          <p>
            Phương thức tính phí <span>{modelname[detail["free_mode"] - 1]}</span>
          </p>
          <p>
            Thời gian giao hàng <span>{detail["limitationofdelivery"]}</span>
          </p>
          <p>
            Thuế quan dự kiến <span>{detail["tariff"] ? detail["tariff"] : 0}</span>
          </p>
          <p>
            Thuế dịch vụ gia tăng
            <span>{detail["service_route"] ? detail["service_route"] : 0}</span>
          </p>
        </div>
      </div>
      <div className="common-container">
        <div className="c-c-title">Tiêu chuẩn tính phí</div>
        <div className="c-c-content">{renderFreeMode()}</div>
      </div>
      <div className="common-container">
        <div className="c-c-title">Đặc điểm tuyến đường</div>
        <div className="c-c-content">{detail["line_special"]}</div>
      </div>
      <div className="common-container">
        <div className="c-c-title">Hạn chế hàng hóa</div>
        <div className="c-c-content">{detail["goods_limit"]}</div>
        <div className="c-c-title">Hạn chế trọng lượng</div>
        <div className="c-c-content">{detail["weight_limit"]}</div>
        <div className="c-c-title">Hạn chế chiều dài</div>
        <div className="c-c-content">{detail["length_limit"]}</div>
      </div>
      <div className="common-container">
        <div className="c-c-title">Quy tắc thêm</div>
        <div className="c-c-content">2222222222</div>
      </div>
    </Page>
  );
};
export default AddressPage;