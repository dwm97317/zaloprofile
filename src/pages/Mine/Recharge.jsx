import React, { useEffect } from "react";
import { Input, Page } from "zmp-ui";
import util from "../../utils/util";
import Header from "../../components/Header/Header";
import "./Mine.scss";

const RechargePage = () => {
  useEffect(() => {
    util.setBarPageView("Nạp tiền vào tài khoản");
  }, []);
  
  return (
    <Page className="page mine">
      <Header></Header>
      <div className="recharge-header">
        <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img127.png" />
        <div className="recharge-lable">Số dư của tôi (￥)</div>
        <div className="recharge-amount">100</div>
      </div>
      <div className="recharge-content">
        <div className="recharge-title">Số tiền nạp</div>
        <div className="recharge-list">
          <div className="recharge-item active">Nạp 5000 tặng 1000</div>
          <div className="recharge-item">Nạp 5000 tặng 1000</div>
          <div className="recharge-item">Nạp 5000 tặng 1000</div>
        </div>
        <div className="recharge-title">Nạp tiền tùy chỉnh</div>
        <div className="recharge-input">
          <Input placeholder="Vui lòng nhập số tiền" />
        </div>
      </div>
      <div className="recharge-pay-method-content">
        <div className="recharge-title">Phương thức thanh toán</div>
        <div className="recharge-pay-list">
          <div className="recharge-pay-item">
            <div className="recharge-pay-label">
              <div className="recharge-pay-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img128.png" />
              </div>
              ZaloPay
            </div>
            <div className="checked"></div>
          </div>
          <div className="recharge-pay-item">
            <div className="recharge-pay-label">
              <div className="recharge-pay-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img130.png" />
              </div>
              Thanh toán bằng số dư
            </div>
            <div className="checked"></div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default RechargePage;