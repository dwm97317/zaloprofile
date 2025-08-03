import React, { useEffect, useState } from "react";
import { Page, useNavigate } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { lineIdState, queryFormState } from "../../state";
import request from "../../utils/request";
import Empty from "../../components/Empty";
import Header from "../../components/Header/Header";
import "./Index.scss";
import util from "../../utils/util";

const FreightResultPage = () => {
  const navigate = useNavigate();
  const setFormQueryData = useSetRecoilState(queryFormState);
  const formQuery = useRecoilValue(queryFormState);
  const setLineId = useSetRecoilState(lineIdState);
  const [alllist, setAllList] = useState([]);
  const [list, setList] = useState([]);
  
  // Lấy danh sách kết quả tính cước
  const getQueryFreightList = () => {
    const url = "page/getfree";
    request.post(url + "&wxapp_id=10001", formQuery).then((res) => {
      const list = res.data;
      if (list) {
        setList(list);
      }
    });
  };
  
  const getAllList = () => {
    const url = "page/getAllline";
    request
      .get(url + "&wxapp_id=10001", { country_id: formQuery["country_id"] })
      .then((res) => {
        const alllist = res.data;
        setAllList(alllist);
      });
  };
  
  const toDetail = (e, params) => {
    if (params) {
      setLineId(params);
    }
    navigate(e);
  };
  
  useEffect(() => {
    console.log("Mô phỏng componentDidMount lần render đầu tiên");
    getQueryFreightList();
    getAllList();
    setFormQueryData("");
    util.setBarPageView("Kết quả ước tính");
    return () => {
      console.log("Mô phỏng componentWillUnmount thực thi sau khi hủy");
    };
  }, []);
  
  return (
    <Page className="page freight">
      <Header></Header>
      <div className="tips">
        <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img34.png" />
        Lưu ý: Khối lượng có thể tăng khi đóng gói, khối lượng thực tế sẽ được tính khi xuất kho!
      </div>
      <div className="container">
        <div className="container-content">
          {list.length == 0 ? <Empty /> : ""}
          {list.map((item, index) => {
            return (
              <div
                className="route-item item-border-bottom"
                key={index}
                onClick={(e) => toDetail("/common/line/detail", item.id)}
              >
                <div className="route-img">
                  <img
                    src={
                      item["image"]
                        ? item["image"]
                        : "https://www.hrbmu.edu.cn/jwc/images/no_pic.png"
                    }
                  ></img>
                </div>
                <div className="route-content">
                  <div className="route-text">
                    {item["name"]}-(Thời gian giao hàng-{item["limitationofdelivery"]})
                  </div>
                  <div className="route-text">Thuế quan:{item["tariff"]}</div>
                  <div className="route-text">Nhấn để xem chi tiết</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="container-label">
          <div className="container-label-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img14.png" />
          </div>
          Tất cả tuyến đường
        </div>
        <div className="container-content">
          {alllist.map((item, index) => {
            return (
              <div
                className="route-item item-border-bottom"
                key={index}
                onClick={(e) => toDetail("/common/line/detail", item.id)}
              >
                <div className="route-img">
                  <img
                    src={
                      item["image"]
                        ? item["image"]
                        : "https://www.hrbmu.edu.cn/jwc/images/no_pic.png"
                    }
                  ></img>
                </div>
                <div className="route-content">
                  <div className="route-text">
                    {item["name"]}-(Thời gian giao hàng-{item["limitationofdelivery"]})
                  </div>
                  <div className="route-text">Thuế quan:{item["tariff"]}</div>
                  <div className="route-text">Nhấn để xem chi tiết</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
};
export default FreightResultPage;