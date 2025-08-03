import React, { useEffect, useState } from "react";
import { Button, Input, Page, useNavigate, Modal } from "zmp-ui";
import { useSetRecoilState } from "recoil";
import { expressSnState, packageInfoState, userState } from "../../state";
import request from "../../utils/request";
import Header from "../../components/Header/Header";
import "./Index.scss";
import { showToast } from "zmp-sdk";
import util from "../../utils/util";

const OrderPackagePage = () => {
  const setPackage = useSetRecoilState(packageInfoState);
  const setExpress = useSetRecoilState(expressSnState);
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [tab, setTab] = useState(1);
  const [id, setId] = useState(0);
  const [count, setCount] = useState({
    'nocount':0,
    'yescount':0,
    'yessend':0,
    "procount":0,
  });
  const [confirmVisable, setConfirmVisable] = useState(false);

  // Lấy danh sách kiện hàng
  const getOrderList = (params) => {
    const url = "package/outside";
    let form = {
      status: params ? params["tab"] : 1,
    };
    if (params && params["keyword"]) {
      form["keyword"] = params["keyword"];
    }
    request.get(url + "&wxapp_id=10001", form).then((res) => {
      const list = res.data.data;
      setList(list);
    });
  };
  
  // Đi đến chi tiết
  const targetDetail = (index) => {
    const info = list[index];
    setPackage(info);
    navigate("/package/pack/detail");
  };
  
  // Hủy
  const handleCancel = (id) => {
    setConfirmVisable(true);
    setId(id);
  };

  const doCancel = () => {
    setConfirmVisable(false);
    request.post("package/cancle&wxapp_id=10001", { id: id }).then((res) => {
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

  // Chỉnh sửa
  const handleEdit = (index) => {
    const info = list[index];
    setPackage(info);
    navigate("/package/pack/modify");
  };

  // Lấy số lượng
  const getToDoCount = () => {
    request.get("/package/countpack&wxapp_id=10001").then((res) => {
      let _count = res.data;
      setCount(_count);
    });
  };

  // Xem vận chuyển
  const handleTologistics = (e) => {
    setExpress(e);
    navigate("/query");
  };

  // Tìm kiếm
  const handleSearch = (e) => {
    getOrderList({ keyword: e.target.value, tab: tab });
  };

  // Chuyển tab
  const handleTab = (tabIndex) => {
    setTab(tabIndex);
    getOrderList({ tab: tabIndex });
  };

  useEffect(() => {
    console.log("Mô phỏng componentDidMount lần render đầu tiên");
    util.checkLogin(getOrderList).then((res) => {
      if (res) {
        getToDoCount();
      }
      if (!res) {
        setTimeout(() => {
          navigate("/mine");
        }, 1000);
      }
    });
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
        description="Bạn có chắc chắn thực hiện thao tác này?"
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
          className={`tab-item ${tab == 1 ? "active" : ""}`}
          onClick={(e) => {
            handleTab(1);
          }}
        >
          Chưa nhập kho({count["nocount"] || 0})
        </div>
        <div
          className={`tab-item ${tab == 2 ? "active" : ""}`}
          onClick={(e) => {
            handleTab(2);
          }}
        >
          Đã nhập kho({count["yescount"] || 0})
        </div>
        <div
          className={`tab-item ${tab == 3 ? "active" : ""}`}
          onClick={(e) => {
            handleTab(3);
          }}
        >
          Đã gửi hàng({count["yessend"] || 0})
        </div>
        <div
          className={`tab-item ${tab == -1 ? "active" : ""}`}
          onClick={(e) => {
            handleTab(-1);
          }}
        >
          Kiện có vấn đề({count["procount"] || 0})
        </div>
      </div>
      <div className="search">
        <div className="search-icon">
          <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img38.png" />
        </div>
        <div className="search-input">
          <Input
            className="search-input-form"
            onBlur={(e) => {
              handleSearch(e);
            }}
            placeholder="Vui lòng nhập số vận đơn"
          />
        </div>
      </div>
      {list.map((item, index) => {
        return (
          <div className="package-container" key={index}>
            <div className="package-container-inner">
              <div className="package-item">
                <div className="country-box">
                  <div className="package-item-icon">
                    <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img24.png"></img>
                  </div>
                  {item["storage"]["shop_name"]}
                </div>
                <div
                  className="pack-detail"
                  onClick={(e) => targetDetail(index)}
                >
                  Xem chi tiết
                </div>
              </div>
              <div className="package-item">
                <div className="country-box">
                  <div className="package-item-icon">
                    <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img27.png"></img>
                  </div>
                  Số kiện hàng:{item["order_sn"]}
                </div>
              </div>
              <div className="package-container-con">
                <p>
                  <span>Quốc gia gửi hàng：</span>
                  {item["country"] ? item["country"]["title"] : "Chưa điền"}
                </p>
                <p>
                  <span>Thông tin hàng hóa：</span>
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
                    className="package-btn-normal"
                    onClick={(e) => handleCancel(item["id"])}
                  >
                    Hủy dự báo
                  </Button>
                ) : (
                  ""
                )}
                {item.status != -1 && item.status != 3 ? (
                  <Button
                    className="package-btn-normal"
                    onClick={(e) => handleEdit(index)}
                  >
                    Sửa dự báo
                  </Button>
                ) : (
                  ""
                )}
                <Button
                  className="package-btn-op"
                  onClick={(e) => {
                    handleTologistics(item["express_num"]);
                  }}
                >
                  Xem vận chuyển
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </Page>
  );
};
export default OrderPackagePage;