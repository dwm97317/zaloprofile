import React, { useEffect, useState } from "react";
import { Page, useNavigate } from "zmp-ui";
import { useRecoilValue } from "recoil";
import { userState } from "../../../state";
import request from "../../../utils/request";
import "./Index.scss";

const OrderHelperPage = () => {
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const [store, setStore] = useState([]);
  const [newuserprocess, setNewuserprocess] = useState([]);
  
  // Lấy danh sách kho hàng
  const getStorageList = () => {
    request.get("page/goods_line&wxapp_id=10001").then((res) => {
      bestLine = res.data;
      setBestLine(bestLine);
    });
  };
  
  const getSetting = () => {
    request.get("page/service&wxapp_id=10001").then((res) => {
      let process = res.data.userclient.newuserprocess;
      setNewuserprocess(process);
    });
  };
  
  useEffect(() => {
    console.log("Mô phỏng componentDidMount lần render đầu tiên");
    getSetting();
    return () => {
      console.log("Mô phỏng componentWillUnmount thực thi sau khi hủy");
    };
  }, []);
  
  return (
    <Page className="page help">
      <div className="container-1">
        <div className="step-title">
          <div className="step-title-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img168.png" />
          </div>
          {newuserprocess.first_title}
        </div>
        <div className="step-descrition">{newuserprocess.first_remark}</div>
      </div>
      <div className="container-1">
        <div className="step-title">
          <div className="step-title-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img170.png" />
          </div>
          {newuserprocess.second_title}
        </div>
        <div className="step-descrition">{newuserprocess.second_remark}</div>
      </div>
      <div className="container-1">
        <div className="step-title">
          <div className="step-title-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img170.png" />
          </div>
          {newuserprocess.third_title}
        </div>
        <div className="step-descrition">{newuserprocess.third_remark}</div>
      </div>
      <div className="container-1">
        <div className="step-title">
          <div className="step-title-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img168.png" />
          </div>
          {newuserprocess.fourth_title}
        </div>
        <div className="step-descrition">{newuserprocess.fourth_remark}</div>
      </div>
    </Page>
  );
};
export default OrderHelperPage;