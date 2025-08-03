import React, { useEffect, useState } from "react";
import { Button, Page, useNavigate } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { packInfoState, userState } from "../../state";
import Header from "../../components/Header/Header";
import request from "../../utils/request";
import "./Index.scss";
import { showToast } from "zmp-sdk";
import util from "../../utils/util";

const AddressPage = () => {
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const setPackInfo = useSetRecoilState(packInfoState);
  let [allCheck, setAllCheck] = useState(false);
  let [checkNum, setCheckNum] = useState(0);
  const [list, setList] = useState([]);
  
  // Lấy danh sách chờ đóng gói
  const getunpackList = () => {
    const url = "/package/unpack";
    request.get(url + "&wxapp_id=10001").then((res) => {
      const list = res.data.data;
      setList(list);
    });
  };

  // Sự kiện chọn
  const handleSelect = (e, index) => {
    list[index]["is_select"] = list[index]["is_select"] ? false : true;
    checkIsSelect();
    setList([...list]);
  };

  // Kiểm tra đã chọn tất cả chưa
  const checkIsSelect = () => {
    let checkNum = 0;
    list.map((item, index) => {
      if (item["is_select"]) {
        checkNum++;
      }
    });
    const isAllCheck = list.length == checkNum ? true : false;
    setCheckNum(checkNum);
    setAllCheck(isAllCheck);
  };

  // Lấy ID đã chọn
  const getSelectIds = () => {
    let ids = [];
    list.map((item, index) => {
      if (item["is_select"]) {
        ids.push(item["id"]);
      }
    });
    return ids;
  };

  // Chọn tất cả / Bỏ chọn tất cả
  const handleAllSelect = (e) => {
    if (allCheck) {
      allCheck = false;
      // Bỏ chọn tất cả
      list.map((item, index) => {
        item["is_select"] = false;
      });
    } else {
      allCheck = true;
      // Chọn tất cả
      list.map((item, index) => {
        item["is_select"] = true;
      });
    }
    checkIsSelect();
    setAllCheck(allCheck);
    setList([...list]);
  };

  // Gửi
  const handleSubmit = () => {
    let ids = getSelectIds();
    if (ids.length == 0) {
      showToast({
        message: "Vui lòng chọn kiện hàng trước",
      });
      return;
    }
    let packInfo = {
      num: checkNum,
      ids: ids,
    };
    setPackInfo(packInfo);
    navigate("/package/pack/confirm");
  };

  useEffect(() => {
    console.log("Mô phỏng componentDidMount lần render đầu tiên");
    util.checkLogin(getunpackList).then((res) => {
      if (!res) {
        setTimeout(() => {
          navigate("/mine");
        }, 1000);
      }
    });
    util.setBarPageView("Chờ đóng gói");
    return () => {
      console.log("Mô phỏng componentWillUnmount thực thi sau khi hủy");
    };
  }, []);
  
  return (
    <Page className="page package">
      <Header></Header>
      <div className="tips">
        <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img34.png" />
        Lưu ý: Khối lượng có thể tăng khi đóng gói, khối lượng thực tế sẽ được tính khi xuất kho!
      </div>
      {list.map((item, index) => {
        return (
          <div className="package-container" key={index}>
            <div className="package-container-inner">
              <div className="package-item">
                <div className="country-box">
                  <div
                    onClick={(e) => {
                      handleSelect(e, index);
                    }}
                    className={`check ${item["is_select"] ? "" : "no-check"}`}
                  >
                    {item["is_select"] ? (
                      <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img36.png"></img>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="package-item-icon">
                    <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img24.png"></img>
                  </div>
                  {item["storage"]["shop_name"]}
                </div>
              </div>
              <div className="package-item">
                <div className="country-box">
                  <div className="package-item-icon">
                    <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img27.png"></img>
                  </div>
                  Số kiện hàng: {item["order_sn"]}
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
            </div>
          </div>
        );
      })}
      <div className="button pack-btns">
        <div className="pack-all-check">
          <div
            onClick={(e) => {
              handleAllSelect(e);
            }}
            className={`check ${allCheck ? "" : "no-check"}`}
          >
            {allCheck ? (
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img36.png"></img>
            ) : (
              ""
            )}
          </div>
          Chọn tất cả, đã chọn {checkNum} kiện
        </div>
        <div className="pack-btn">
          <Button onClick={(e) => handleSubmit()}>Gửi đóng gói</Button>
        </div>
      </div>
    </Page>
  );
};
export default AddressPage;