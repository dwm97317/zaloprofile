import React, { useEffect, useState } from "react";
import { Button, Page, useNavigate } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userState } from "../../state";
import request from "../../utils/request";
import "./Index.scss";
import util from "../../utils/util";

const CommonCommentPage = () => {
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  
  // Lấy danh sách bình luận
  const getCommentList = () => {
    const url = "comment/hotMoreComment";
    request.get(url + "&wxapp_id=10001").then((res) => {
      const data = res.data.data;
      setList(data);
    });
  };

  useEffect(() => {
    console.log("Mô phỏng componentDidMount lần render đầu tiên");
    util.setBarPageView("Danh sách bình luận");
    getCommentList();
    return () => {
      console.log("Mô phỏng componentWillUnmount sau khi hủy");
    };
  }, []);
  
  return (
    <Page className="page common">
      <div className="comment-container">
        {list.map((item, index) => {
          return (
            <div className="comment-item" key={index}>
              <div className="comment-avatar">
                <img
                  src={
                    item.user
                      ? item.user.avatarUrl
                      : "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img19.png"
                  }
                  alt="Ảnh đại diện"
                />
              </div>
              <div className="comment-content">
                <div className="comment-row">
                  <p className="username">
                    {item["user"] ? item["user"]["nickName"] : "Không xác định"}
                  </p>
                  <p>{item["create_time"]}</p>
                </div>
                <div className="comment-row">
                  <p>Mã đơn hàng:{item["order_sn"]}</p>
                  <p></p>
                </div>
                <div className="comment-row">
                  <div className="comment-content-1">{item["content"]}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
};
export default CommonCommentPage;
