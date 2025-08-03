import React, { useEffect, useState } from "react";
import { Page, useNavigate } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userState } from "../../state";
import request from "../../utils/request";
import "./Index.scss";

const OrderVerifyPage = () => {
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const navH = 0;
  const [helperlist, setHelperlist] = useState([]);
  
  // Lấy danh sách kho hàng
  const getVerifyList = () => {
    const url = "package/verify";
    request.get(url + "&wxapp_id=10001").then((res) => {
      const helper = res.data.data;
      setHelperlist(helper);
    });
  };
  
  const targetDetail = (e, id) => {
    navigate("/package/verify/detail");
  };
  
  useEffect(() => {
    console.log("Mô phỏng componentDidMount lần render đầu tiên");
    getVerifyList();
    return () => {
      console.log("Mô phỏng componentWillUnmount thực thi sau khi hủy");
    };
  }, []);
  
  return (
    <Page className="page order">
      {/* Nội dung trang sẽ được thêm ở đây */}
    </Page>
  );
};
export default OrderVerifyPage;