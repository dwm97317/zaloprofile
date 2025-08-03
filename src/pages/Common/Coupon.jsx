import React, { useEffect, useState } from "react";
import { Button, Page, useNavigate } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userState } from "../../state";
import request from "../../utils/request";
import "./Index.scss";
import util from "../../utils/util";
import Empty from "../../components/Empty";
import Header from "../../components/Header/Header";

const CommonCouponPage = () => {
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [tab, setTab] = useState(1);

  // 获取线路详情
  const getCouponList = (index) => {
    const url = "/user.coupon/lists";
    request.get(url + "&wxapp_id=10001", { data_type: index }).then((res) => {
      const data = res.data.list;
      setList(data);
    });
  };

  useEffect(() => {
    console.log("模拟componentDidMount第一次渲染");
    util.setBarPageView("Danh sách phiếu giảm giá"); // 优惠券列表
    getCouponList(0);
    return () => {
      console.log("模拟componentWillUnmount执行销毁后");
    };
  }, []);
  
  return (
    <Page className="page common">
      <Header></Header>
      <div className="coupon-tab">
        <div
          className={`c-tab ${tab == 1 ? "active" : ""}`}
          onClick={(e) => {
            setTab(1);
            getCouponList(0);
          }}
        >
          Chưa sử dụng {/* 待使用 */}
        </div>
        <div
          className={`c-tab ${tab == 2 ? "active" : ""}`}
          onClick={(e) => {
            setTab(2);
            getCouponList(1);
          }}
        >
          Đã sử dụng {/* 已使用 */}
        </div>
        <div
          className={`c-tab ${tab == 3 ? "active" : ""}`}
          onClick={(e) => {
            setTab(3);
            getCouponList(2);
          }}
        >
          Hết hạn {/* 已失效 */}
        </div>
      </div>
      <div className="coupon-content">
        {list.length == 0 ? <Empty /> : ""}
        <div className="coupon-content-list">
          {list.map((item, index) => {
            return (
              <div className="coupon-item" key={index}>
                <div className="coupon-main">
                  <div className="coupon-main-inner">
                    <div className="coupon-name">{item["discount"]}</div>
                    <div className="coupon-desc">
                      <p>₫</p> {/* 元 (但改为越南盾符号) */}
                      <p>{item["name"]}</p>
                    </div>
                    <div className="coupon-infos">
                      <p>Áp dụng toàn bộ sản phẩm</p> {/* 全场通用 */}
                      <p>{item["create_time"]}</p>
                    </div>
                  </div>
                </div>
                <div className="coupon-button">
                  <div className="coupon-radius-left"></div>
                  <div className="coupon-radius-right"></div>
                  Sử dụng ngay {/* 立即使用 */}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
};
export default CommonCouponPage;