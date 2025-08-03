import React, { useEffect, useState } from "react";
import { Page, useNavigate, Text } from "zmp-ui";
import { useRecoilValue } from "recoil";
import { userState, guideIdState } from "../../../state";
import request from "../../../utils/request";
import "./Index.scss";
import util from "../../../utils/util";
import Header from "../../../components/Header/Header";

const DetailHelperPage = () => {
  const user = useRecoilValue(userState);
  const guideId = useRecoilValue(guideIdState);
  const navigate = useNavigate();
  const [detail, setDetail] = useState([]);
  
  // Lấy chi tiết bài viết
  const getDetail = () => {
    request
      .get("Article/detail&wxapp_id=10001", { article_id: guideId })
      .then((res) => {
        const detail = res.data.detail;
        setDetail(detail);
      });
  };

  useEffect(() => {
    getDetail();
    util.setBarPageView("Chi tiết");
    return () => {};
  }, []);
  
  return (
    <Page className="page help">
      <Header></Header>
      <div className="article-content">
        <div
          dangerouslySetInnerHTML={{ __html: detail["article_content"] }}
        ></div>
      </div>
    </Page>
  );
};
export default DetailHelperPage;