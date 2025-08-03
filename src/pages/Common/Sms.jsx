import React, { useEffect, useState } from "react";
import { Button, Page, useNavigate } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userState } from "../../state";
import request from "../../utils/request";
import "./Index.scss";
import util from "../../utils/util";
import Empty from "../../components/Empty";

const CommonSmsPage = () => {
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  // 获取线路详情
  const getSmsList = () => {
    const url = "user/smslist";
    request.get(url + "&wxapp_id=10001").then((res) => {
      const data = res.data.data;
      setList(data);
    });
  };

  useEffect(() => {
    console.log("模拟componentDidMount第一次渲染");
    util.setBarPageView("私信列表");
    getSmsList();
    return () => {
      console.log("模拟componentWillUnmount执行销毁后");
    };
  }, []);
  return (
    <Page className="page common">
      <Empty />
    </Page>
  );
};
export default CommonSmsPage;
