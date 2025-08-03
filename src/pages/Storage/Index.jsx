import React, { useEffect, useState } from "react";
import { Button, Page, useNavigate } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { storageIdState, userState } from "../../state";
import Header from "../../components/Header/Header";
import request from "../../utils/request";
import "./Index.scss";
import util from "../../utils/util";

const StoragePage = () => {
  const user = useRecoilValue(userState);
  const setStorageId = useSetRecoilState(storageIdState);
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  
  // Lấy danh sách kho hàng
  const getStorageList = () => {
    const url = "page/storageList";
    request.get(url + "&wxapp_id=10001").then((res) => {
      const list = res.data;
      setList(list);
    });
  };
  
  const targetDetail = (e, id) => {
    setStorageId(id);
    navigate("/storage/detail");
  };
  
  useEffect(() => {
    console.log("Mô phỏng componentDidMount lần render đầu tiên");
    util.setBarPageView("Danh sách kho hàng");
    util.checkLogin(getStorageList).then((res) => {
      if (!res) {
        setTimeout(() => {
          navigate(-1);
        }, 1000);
      }
    });
    return () => {
      console.log("Mô phỏng componentWillUnmount thực thi sau khi hủy");
    };
  }, []);
  
  return (
    <Page className="page storage">
      <Header></Header>
      {list.map((item, index) => {
        return (
          <div
            className="container"
            key={index}
            onClick={(e) => targetDetail(e, item["shop_id"])}
          >
            <div className="storage-title">{item["shop_name"]}</div>
            <div className="storage-content">
              <div className="storage-row">
                <div className="storage-row-icon">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img198.png" />
                </div>
                {item["region"]["province"] +
                  item["region"]["city"] +
                  item["region"]["region"] +
                  item["address"]}
              </div>
              <div className="storage-row">
                <div className="storage-row-icon">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img199.png" />
                </div>
                {item["phone"]}
              </div>
              <div className="storage-row" style={{ height: 70 + "px" }}>
                <Button className="storage-view-btn">Xem chi tiết</Button>
              </div>
            </div>
          </div>
        );
      })}
    </Page>
  );
};
export default StoragePage;