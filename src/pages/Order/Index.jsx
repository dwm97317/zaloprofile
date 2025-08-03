import React, { useEffect, useState } from "react";
import { Page, useNavigate, Button, Modal } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { orderIdState, orderStatusState, userState } from "../../state";
import request from "../../utils/request";
import Empty from "../../components/Empty";
import copy from "copy-to-clipboard";
import "./Index.scss";
import Loading from "../../components/Loading/Index";
import Header from "../../components/Header/Header";
import util from "../../utils/util";
import { showToast } from "zmp-sdk";

const TrangDonHang = () => {
  const user = useRecoilValue(userState);
  const setOrderId = useSetRecoilState(orderIdState);
  const orderStatus = useRecoilValue(orderStatusState);
  const navigate = useNavigate();
  const [tab, setTab] = useState(1);
  const [list, setList] = useState([]);
  const [confirmVisable, setConfirmVisable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [id, setId] = useState(0);
  const typeMap = ["", "verify", "nopay", "no_send", "send", "complete"];
  
  // Lấy danh sách đơn hàng
  const getOrderList = (params) => {
    const url = "package/packagelist";
    request
      .get(url + "&wxapp_id=10001", { type: typeMap[params["tab"]] })
      .then((res) => {
        const list = res.data.data;
        setList(list);
      });
  };

  // Chuyển tab
  const handleTab = (tabIndex) => {
    setTab(tabIndex);
    getOrderList({ tab: tabIndex });
  };

  const handleCopy = (e) => {
    copy(e);
    showToast({
      message: "Sao chép thành công",
    });
  };

  const handleDetail = (e, id) => {
    setOrderId(id);
    navigate("/order/detail");
  };

  const handleCancel = (id) => {
    setConfirmVisable(true);
    setId(id);
  };

  const handlePay = (id) =>{
    setLoading(true);
    setLoadingText("Vui lòng chờ");
    console.log(id,'id');
    request.post("package/doPay&wxapp_id=10001", { id: id , 'paytype':10 }).then((res)=>{
       setLoading(false);
       setLoadingText("");
       if (res.code == 1) {
          showToast({
            message: "Thanh toán thành công",
          });
          return;
        } else {
          console.log(res.msg,'msg-error');
          showToast({
            message: res.msg,
          });
        }
    })
  }

  const doCancel = () => {
    setConfirmVisable(false);
    request
      .post("package/canclePack&wxapp_id=10001", { id: id })
      .then((res) => {
        if (res.code == 1) {
          showToast({
            message: "Hủy thành công",
          });
          return;
        } else {
          showToast({
            message: res.msg,
          });
        }
      });
  };

  useEffect(() => {
    console.log("Mô phỏng componentDidMount lần render đầu tiên");
    console.log(orderStatus, "o");
    setTab(orderStatus);
    util
      .checkLogin(function () {
        getOrderList({ tab: orderStatus });
      })
      .then((res) => {
        if (!res) {
          setTimeout(() => {
            navigate("/mine");
          }, 1000);
        }
      });
    return () => {
      console.log("Mô phỏng componentWillUnmount sau khi hủy");
    };
  }, []);
  
  return (
    <Page className="page order">
      <Header></Header>
      <Modal
        visible={confirmVisable}
        title="Thông báo"
        description="Hủy đơn hàng này vẫn có thể phát sinh phí bổ sung?"
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
      <div className="tab">
        <div
          className={`tab-item ${tab == "" ? "active" : ""}`}
          onClick={(e) => {
            handleTab("");
          }}
        >
          Tất cả
        </div>
        <div
          className={`tab-item ${tab == 1 ? "active" : ""}`}
          onClick={(e) => {
            handleTab(1);
          }}
        >
          Chờ kiểm tra
        </div>
        <div
          className={`tab-item ${tab == 2 ? "active" : ""}`}
          onClick={(e) => {
            handleTab(2);
          }}
        >
          Chờ thanh toán
        </div>
        <div
          className={`tab-item ${tab == 3 ? "active" : ""}`}
          onClick={(e) => {
            handleTab(3);
          }}
        >
          Chờ gửi hàng
        </div>
        <div
          className={`tab-item ${tab == 4 ? "active" : ""}`}
          onClick={(e) => {
            handleTab(4);
          }}
        >
          Đã gửi hàng
        </div>
        <div
          className={`tab-item ${tab == 5 ? "active" : ""}`}
          onClick={(e) => {
            handleTab(5);
          }}
        >
          Hoàn thành
        </div>
      </div>
      
      {list.length == 0 ? <Empty /> : ""}
      {list.map((item, index) => {
        return (
          <div className="package-container" key={index}>
            <div className="package-container-inner">
              <div
                className="package-item"
                onClick={(e) => handleDetail(e, item["id"])}
              >
                <div className="country-box">
                  <div className="package-item-icon">
                    <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img24.png"></img>
                  </div>
                  {item["storage"]["shop_name"]}
                </div>
                <div
                  className="order-status"
                  onClick={(e) => targetDetail(index)}
                >
                  {item["status"] == 1 ? "Chờ kiểm tra" : ""}
                  {item["status"] == 2 && item["is_pay"] == 2 ? "Chờ thanh toán" : ""}
                  {item["status"] == 3 && item["is_pay"] == 1 ? "Đã thanh toán" : ""}
                  {item["status"] == 4 && item["is_pay"] == 1 ? "Đang đóng gói" : ""}
                  {item["status"] == 5 && item["is_pay"] == 1 ? "Đang đóng gói" : ""}
                  {item["status"] == 6 && item["is_pay"] == 1 ? "Đã gửi hàng" : ""}
                  {item["status"] == 7 && item["is_pay"] == 1 ? "Chờ nhận hàng" : ""}
                  {item["status"] == 8 && item["is_pay"] == 1 ? "Hoàn thành" : ""}
                  {item["status"] == -1 ? "Đã hủy" : ""}
                </div>
              </div>
              <div className="package-item">
                <div className="country-box">
                  <div className="package-item-icon">
                    <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img27.png"></img>
                  </div>
                  Mã đơn hàng:{item["order_sn"]} <span className="copy" onClick={(e) => handleCopy(item["order_sn"])}> [Sao chép]</span>
                </div>
              </div>
              <div className="package-container-con">
                <p>
                  <span>Quốc gia gửi đến：</span>
                  {item["country"] ? item["country"]["title"] : "Chưa điền"}
                </p>
                <p>
                  <span>Thông tin vật phẩm：</span>
                  {item["class_name"]}
                </p>
                <p>
                  <span>Thời gian báo cáo：</span>
                  {item["created_time"]}
                </p>
              </div>
              <div className="package-button">
                {item.status != -1 && item.status != 3 ? (
                  <Button
                    className="package-btn-op"
                    onClick={(e) => handleCancel(item["id"])}
                  >
                    Hủy đơn hàng
                  </Button>
                ) : (
                  ""
                )}
                {item.status != -1 && item.status != 3 ? (
                  <Button
                    className="package-btn-op"
                    onClick={(e) => handleDetail(index)}
                  >
                    Xem chi tiết
                  </Button>
                ) : (
                  ""
                )}
                {item.status==2?<Button
                  className="package-btn-op"
                  onClick={(e) => handlePay(item["id"])}
                >
                  Thanh toán
                </Button>:''}
              </div>
            </div>
          </div>
        );
      })}
      <Loading is={loading} text={loadingText} />
    </Page>
  );
};
export default TrangDonHang;