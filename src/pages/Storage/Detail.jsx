import React, { useEffect, useState } from "react";
import { Button, Page, useNavigate } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { storageIdState, userState } from "../../state";
import request from "../../utils/request";
import Header from "../../components/Header/Header";
import { showToast } from "zmp-sdk";
import "./Index.scss";
import util from "../../utils/util";
import copy from "copy-to-clipboard";

const StoragePage = () => {
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const storageId = useRecoilValue(storageIdState);
  const [detail, setDetail] = useState({});
  
  // Lấy chi tiết kho hàng
  const getDetail = () => {
    const url = "page/storageDetails";
    request.get(url + "&wxapp_id=10001", { id: storageId }).then((res) => {
      const detail = res.data;
      setDetail(detail);
    });
  };
  
  const handleClick = (e) => {
    copy(e.target.dataset.text);
    showToast({
      message: "Sao chép thành công",
    });
  };
  
  useEffect(() => {
    console.log("Mô phỏng componentDidMount lần render đầu tiên");
    util.setBarPageView("Chi tiết kho hàng");
    getDetail();
    return () => {
      console.log("Mô phỏng componentWillUnmount thực thi sau khi hủy");
    };
  }, []);
  
  return (
    <Page className="page storage">
      <Header></Header>
      <div className="container" style={{ paddingBottom: 15 + "px" }}>
        <div className="row">
          <div className="row-label">Người nhận</div>
          <div className="row-content">{detail["linkman"]}</div>
          <div
            className="btn-copy"
            onClick={(e) => handleClick(e)}
            data-text={detail["linkman"]}
          >
            Sao chép
          </div>
        </div>
        <div className="row">
          <div className="row-label">Số điện thoại</div>
          <div className="row-content">{detail["phone"]}</div>
          <div
            className="btn-copy"
            onClick={(e) => handleClick(e)}
            data-text={detail["phone"]}
          >
            Sao chép
          </div>
        </div>
        <div className="row">
          <div className="row-label">Địa chỉ nhận hàng</div>
          <div className="row-content">{detail["address"]}</div>
          <div
            className="btn-copy"
            onClick={(e) => handleClick(e)}
            data-text={detail["address"]}
          >
            Sao chép
          </div>
        </div>
        <div className="row">
          <div className="row-label">Mã bưu điện</div>
          <div className="row-content">{detail["post"]}</div>
          <div
            className="btn-copy"
            onClick={(e) => handleClick(e)}
            data-text={detail["post"]}
          >
            Sao chép
          </div>
        </div>
        <Button
          className="btn-all-copy"
          onClick={(e) => handleClick(e)}
          data-text={
            detail["linkman"] +
            "|" +
            detail["phone"] +
            "|" +
            detail["address"] +
            "|" +
            detail["post"]
          }
        >
          Sao chép một lần
        </Button>
      </div>
      <div className="container">
        <div className="guide-title">
          <div className="guide-title-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img30.png"></img>
          </div>
          Hướng dẫn thao tác
        </div>
        <div className="guide-content">
          <div className="guide-item">
            <div className="guide-step">Bước 1: Sao chép địa chỉ kho hàng</div>
            <div className="guide-content-text">
              Sao chép địa chỉ kho hàng sau đó đến nền tảng mua sắm để đặt hàng,
              dán địa chỉ kho hàng vào địa chỉ nhận hàng trên nền tảng mua sắm.
            </div>
          </div>
          <div className="guide-item">
            <div className="guide-step">Bước 2: Dự báo kiện hàng</div>
            <div className="guide-content-text">
              Sau khi đặt hàng, bạn có thể lấy số vận đơn từ nền tảng mua sắm,
              nhập số vận đơn vào hệ thống dự báo.
            </div>
          </div>
          <div className="guide-item">
            <div className="guide-step">Bước 3: Yêu cầu đóng gói</div>
            <div className="guide-content-text">
              Khi kiện hàng đến kho, bạn có thể yêu cầu kho đóng gói và xuất kho.
            </div>
          </div>
          <div className="guide-item">
            <div className="guide-step">Bước 4: Thanh toán chi phí đơn hàng</div>
            <div className="guide-content-text">
              Sau khi kiện hàng được đóng gói xong, bạn có thể thanh toán chi phí vận chuyển,
              kho hàng sẽ nhanh chóng gửi hàng.
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};
export default StoragePage;