import React, { useEffect, useState } from "react";
import { Button, Input, Page, useNavigate } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { takeFormState, userState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import "./Index.scss";

const PackTakePage = () => {
  const setTakeForm = useSetRecoilState(takeFormState);
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  // Lấy danh sách chờ nhận
  const getPackageList = (params) => {
    const url = "package/packageForTaker";
    let form = {};
    if (params) {
      form["keyword"] = params["keyword"];
    }
    request.get(url + "&wxapp_id=10001", form).then((res) => {
      const list = res.data.data;
      setList(list);
    });
  };

  const targetTakeForm = () => {
    navigate("/package/takeform");
  };

  // Tìm kiếm
  const handleSearch = (e) => {
    console.log(e,'e');
    getPackageList({ keyword: e.target.value });
  };

  useEffect(() => {
    console.log("Mô phỏng componentDidMount lần render đầu tiên");
    util.checkLogin(getPackageList).then((res) => {
      if (!res) {
        setTimeout(() => {
          navigate("/mine");
        }, 1000);
      }
    });
    util.setBarPageView("Nhận kiện hàng");
    setTakeForm("");
    return () => {
      console.log("Mô phỏng componentWillUnmount thực thi sau khi hủy");
    };
  }, []);
  return (
    <Page className="page package">
      <div className="take-bg">
        <div className="header">
          <div className="take-search">
            <span className="take-search-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img38.png"></img>
            </span>
            <Input
              className="take-search-inp"
              placeholder="Vui lòng nhập số vận đơn"
              onBlur={(e) => handleSearch(e)}
            />
          </div>
        </div>
        <div className="take-container">
          {list.map((item, index) => {
            return (
              <div className="take-item" key={index}>
                <div className="take-row">
                  <div className="take-row-icon">
                    <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img27.png" />
                  </div>
                  <span>Số kiện hàng: {item["express_num"]}</span>
                </div>
                <div className="take-row">
                  <div className="take-row-icon"></div>
                  <span>Thời gian nhập kho: {item["entering_warehouse_time"]}</span>
                </div>
                <Button className="take-btn" onClick={(e) => targetTakeForm()}>
                  Nhận
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
};
export default PackTakePage;