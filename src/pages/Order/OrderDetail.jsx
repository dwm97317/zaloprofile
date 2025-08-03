import React, { useEffect, useState } from "react";
import { Page, Button, useNavigate, Modal } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { lineIdState, orderIdState, userState } from "../../state";
import "./Index.scss";
import request from "../../utils/request";
import util from "../../utils/util";
import Header from "../../components/Header/Header";

const PackDetailPage = () => {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);
  const orderId = useRecoilValue(orderIdState);
  const [confirmVisable, setConfirmVisable] = useState(false);
  const setLineId = useSetRecoilState(lineIdState);
  const [detail, setDetail] = useState({ item: [], line: {}, address: [] });
  const [status, setStatus] = useState({});

  const statusMap = [
    {
      id: 1,
      name: "Chờ kiểm tra",
      title: "Kiện hàng của bạn đang chờ kiểm tra",
      img: "dzx_img44.png",
    },
    {
      id: 2,
      name: "Chờ thanh toán",
      title: "Bạn có một đơn hàng chưa thanh toán",
      img: "dzx_img52.png",
    },
    {
      id: 3,
      name: "Đã thanh toán",
      title: "Bạn đã thanh toán đơn hàng này",
      img: "dzx_img52.png",
    },
    {
      id: 4,
      name: "Đang chọn hàng",
      title: "Nhân viên đang chọn hàng nhanh chóng",
      img: "dzx_img44.png",
    },
    {
      id: 5,
      name: "Đang đóng gói",
      title: "Nhân viên đang đóng gói ngày đêm",
      img: "dzx_img55.png",
    },
    {
      id: 6,
      name: "Đã gửi hàng",
      title: "Kiện hàng của bạn đã được gửi",
      img: "dzx_img54.png",
    },
    {
      id: 7,
      name: "Đã nhận hàng",
      title: "Đơn hàng đã được nhận",
      img: "dzx_img55.png",
    },
    {
      id: 8,
      name: "Hoàn thành",
      title: "Kiện hàng của bạn đã giao, đơn hàng hoàn thành",
      img: "dzx_img55.png",
    },
    {
      id: -1,
      name: "Kiện có vấn đề",
      title: "Kiện hàng có vấn đề, vui lòng chờ xử lý",
      img: "dzx_img55.png",
    },
  ];

  const covertKey = (arr, id) => {
    let _arr = [];
    for (let i in arr) {
      _arr[arr[i]["id"]] = arr[i];
    }
    return _arr;
  };

  const getDetail = () => {
    request
      .post("package/details_pack&wxapp_id=10001", {
        id: orderId,
        method: "edit",
      })
      .then((res) => {
        let detail = res.data;
        let statusMaps = covertKey(statusMap, "id");
        setStatus(statusMaps[detail["status"]]);
        setDetail(detail);
      });
  };
  
  const handleCancel = (id) => {
    setConfirmVisable(true);
  };

  const doCancel = () => {
    setConfirmVisable(false);
    request
      .post("package/canclePack&wxapp_id=10001", { id: orderId })
      .then((res) => {
        if (res.code == 1) {
          showToast({
            message: "Xóa thành công",
          });
          return;
        } else {
          showToast({
            message: res.msg,
          });
        }
      });
  };
  
  const toDetail = (e, params) => {
    if (params) {
      setLineId(params);
    }
    navigate(e);
  };

  useEffect(() => {
    getDetail();
    util.setBarPageView("Chi tiết đơn hàng");
    return () => {
      console.log("Mô phỏng componentWillUnmount thực thi sau khi hủy");
    };
  }, []);
  
  return (
    <Page className="page order">
      <Header></Header>
      <Modal
        visible={confirmVisable}
        title="Thông báo"
        description="Hủy đơn hàng này vẫn có thể phát sinh chi phí bổ sung?"
        actions={[
          {
            text: "Hủy",
            onClick: () => {
              setConfirmVisable(false);
            },
            highLight: true,
          },
          {
            text: "Xác nhận",
            onClick: () => {
              doCancel();
            },
          },
        ]}
      />
      <div className="order-header">
        <div className="order-header-content">
          <div className="orderStatus">
            <div className="status-text">{status["name"]}</div>
            <div className="status-desc">{status["title"]}</div>
          </div>
        </div>
      </div>
      <div className="address-wrap" style={{ marginTop: 0 }}>
        <div className="address">
          <div className="address-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img164.png" />
          </div>
          <div className="address-info">
            {detail["address"] ? (
              <div>
                <p className="address-name">
                  {detail["address"]["name"] + detail["address"]["phone"]}
                </p>
                <p>
                  {detail["address"]["province"] +
                    detail["address"]["city"] +
                    detail["address"]["region"] +
                    detail["address"]["detail"]}
                </p>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
      <div className="detail-container">
        <div className="container-item border-bottom">
          <div className="container-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img51.png" />
          </div>{" "}
          Mã đơn hàng：{detail["order_sn"]}
        </div>
        <div className="container-item border-bottom">
          <div className="container-icon">
            {" "}
            <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img51.png" />
          </div>{" "}
          Tình trạng thanh toán：{detail["is_pay"] == 2 ? "Chờ thanh toán" : "Đã thanh toán"}
        </div>
        <div className="container-label">Thông tin kiện hàng</div>
        {detail["item"].map((item, index) => {
          return (
            <div>
              <div className="container-item border-bottom" key={index}>
                <div className="container-icon">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img30.png" />
                </div>
                Số kiện hàng [Số vận đơn]
                <div className="container-text">{item["express_num"]}</div>
              </div>
              <div className="container-item border-bottom">
                <div className="container-icon">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img28.png" />
                </div>
                Vận chuyển
                <div className="container-text">{item["express_name"]}</div>
              </div>
              <div className="container-item border-bottom">
                <div className="container-icon">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img28.png" />
                </div>
                Loại hàng hóa
                <div className="container-text">{item["class_name"]}</div>
              </div>
              <div className="container-item border-bottom">
                <div className="container-icon">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img30.png" />
                </div>{" "}
                Dài/Rộng/Cao/Trọng lượng
                <div className="container-text">
                  {item["length"] +
                    "/" +
                    item["width"] +
                    "/" +
                    item["height"] +
                    "/" +
                    item["weight"]}
                </div>
              </div>
              <div className="container-item border-bottom">
                <div className="container-icon">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img50.png" />
                </div>{" "}
                Thời gian nhập kho
                <div className="container-text">
                  {item["entering_warehouse_time"]}
                </div>
              </div>
              <div className="container-item border-bottom">
                <div className="container-icon">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img30.png" />
                </div>
                Ghi chú
                <div className="container-text">{item["remark"]}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="detail-container">
        <div className="container-label">Thông tin tuyến đường</div>
        <div className="container-content" style={{ paddingBottom: 10 + "px" }}>
          <div
            className="route-item"
            onClick={(e) => toDetail("/common/line/detail", detail["line"].id)}
          >
            <div className="route-img">
              <img
                src={
                  detail["image"]
                    ? detail["image"]
                    : "https://www.hrbmu.edu.cn/jwc/images/no_pic.png"
                }
              ></img>
            </div>
            <div className="route-content">
              <div className="route-text">
                {detail["line"]["name"]}-(Thời gian giao hàng-
                {detail["line"]["limitationofdelivery"]})
              </div>
              <div className="route-text">
                Thuế quan:
                <span style={{ color: "#006cfe" }}>
                  {detail["line"]["tariff"]}
                </span>
              </div>
              <div className="route-text">Nhấn để xem chi tiết</div>
            </div>
          </div>
        </div>
      </div>
      <div className="detail-container">
        <div className="container-label">Thông tin đóng gói</div>
        <div className="container-item border-bottom">
          <div className="container-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img50.png" />
          </div>{" "}
          Trọng lượng
          <div className="container-text">{detail["weight"]}</div>
        </div>
        <div className="container-item border-bottom">
          <div className="container-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img50.png" />
          </div>{" "}
          Dài/Rộng/Cao/Trọng lượng thể tích
          <div className="container-text">
            {detail["length"] +
              "/" +
              detail["width"] +
              "/" +
              detail["height"] +
              "/" +
              detail["volume"]}
          </div>
        </div>
        <div className="container-item border-bottom">
          <div className="container-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img50.png" />
          </div>{" "}
          Trọng lượng tính cước
          <div className="container-text">{detail["cale_weight"]}</div>
        </div>
      </div>
      <div className="detail-container">
        <div className="container-label">Thông tin gửi hàng</div>
        <div className="container-item border-bottom">
          <div className="container-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img29.png" />
          </div>
          Cước vận chuyển cơ bản
          <div className="container-text">{detail["free"]}</div>
        </div>
        <div className="container-item border-bottom">
          <div className="container-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img50.png" />
          </div>{" "}
          Dịch vụ đóng gói
          <div className="container-text">{detail["pack_free"]}</div>
        </div>
        <div className="container-item border-bottom">
          <div className="container-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img50.png" />
          </div>{" "}
          Chi phí khác
          <div className="container-text">{detail["other_free"]}</div>
        </div>
      </div>
      <div className="detail-container" style={{ marginBottom: 80 + "px" }}>
        <div className="container-label">Thông tin ghi chú</div>
        <div className="container-item border-bottom">
          <div className="container-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img30.png" />
          </div>
          Ghi chú
          <div className="container-text">{detail["remark"]}</div>
        </div>
      </div>
      <div className="button">
        <Button className="btn" onClick={(e) => handleCancel(e)}>
          Hủy đơn hàng
        </Button>
      </div>
    </Page>
  );
};
export default PackDetailPage;