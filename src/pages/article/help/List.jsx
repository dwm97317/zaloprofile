import React, { useEffect, useState } from "react";
import { Page, useNavigate } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userState, guideTypeState, guideIdState } from "../../../state";
import request from "../../../utils/request";
import "./Index.scss";
import util from "../../../utils/util";
import Header from "../../../components/Header/Header";

const ListHelperPage = () => {
  const user = useRecoilValue(userState);
  const guideType = useRecoilValue(guideTypeState);
  const setGuideId = useSetRecoilState(guideIdState);
  const navigate = useNavigate();
  const [helperlist, setHelperlist] = useState([]);
  
  // Lấy danh sách bài viết
  const getHelpList = () => {
    const url = guideType == "newUser" ? "page/problem" : "page/ban";
    request.get(url + "&wxapp_id=10001").then((res) => {
      const helper = res.data.data;
      setHelperlist(helper);
    });
  };
  
  const targetDetail = (e, id) => {
    setGuideId(id);
    navigate("/article/help/detail");
  };
  
  useEffect(() => {
    console.log("Mô phỏng componentDidMount lần render đầu tiên");
    getHelpList();
    util.setBarPageView("Danh sách bài viết");
    return () => {
      console.log("Mô phỏng componentWillUnmount thực thi sau khi hủy");
    };
  }, []);
  
  return (
    <Page className="page help">
       <Header></Header>
      <div className="my_jinyun_center">
        {helperlist.map((item, index) => {
          return (
            <div
              className="my_jinyun_list"
              key={index}
              onClick={(e) => {
                targetDetail(e, item.article_id);
              }}
            >
              <div className="my_jinyun_cont">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img172.png"></img>
                <div>{item.article_title}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
};
export default ListHelperPage;