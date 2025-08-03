import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { Page } from "zmp-ui";
import util from "../../utils/util";
import Header from "../../components/Header/Header";
import "./Mine.scss";

const BalancePage = () => {
  const navigate = useNavigate();

  const targetRecharge = () => {
    navigate("/mine/recharge");
  };

  useEffect(() => {
    util.setBarPageView("Số dư của tôi");
  }, []);
  
  return (
    <Page className="page mine">
      <Header></Header>
      <div className="balance-card">
        <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img121.png" />
        <div className="balance-card-inner">
          <div className="balance-card-title">Số dư của tôi (VNĐ)</div>
          <div className="balance-content">
            <div className="balance-num">200.00</div>
            <div className="balance-recharge" onClick={(e) => targetRecharge()}>
              Nạp tiền
            </div>
          </div>
        </div>
      </div>
      <div className="balance-menu">
        <div className="balance-row">
          <div className="balance-label">
            <div className="balance-label-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img122.png" />
            </div>
            <div className="balance-label-text">Chi tiết tài khoản</div>
          </div>
          <div className="balance-menu-right">
            <div className="balance-menu-arrow">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img25.png" />
            </div>
          </div>
        </div>
        <div className="balance-row">
          <div className="balance-label">
            <div className="balance-label-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img124.png" />
            </div>
            <div className="balance-label-text">Tài khoản chuyển tiền</div>
          </div>
          <div className="balance-menu-right">
            <div className="balance-menu-arrow">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img25.png" />
            </div>
          </div>
        </div>
        <div className="balance-row">
          <div className="balance-label">
            <div className="balance-label-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img125.png" />
            </div>
            <div className="balance-label-text">Tải lên chứng từ</div>
          </div>
          <div className="balance-menu-right">
            <div className="balance-menu-arrow">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img25.png" />
            </div>
          </div>
        </div>
        <div className="balance-row">
          <div className="balance-label">
            <div className="balance-label-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img126.png" />
            </div>
            <div className="balance-label-text">Lịch sử chứng từ</div>
          </div>
          <div className="balance-menu-right">
            <div className="balance-menu-arrow">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img25.png" />
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default BalancePage;