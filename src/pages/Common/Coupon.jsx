import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import request from "../../utils/request";
import util from "../../utils/util";
import Loading from "../../components/Loading/Index";
import Tab from "../../components/Tab/Tab";
import "./Coupon.scss";

const CommonCouponPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const getCouponList = async (dataType) => {
    setLoading(true);
    try {
      const res = await request.get("/user.coupon/lists&wxapp_id=10001", { data_type: dataType });
      if (res.data && res.data.list) {
        setList(res.data.list);
      }
    } catch (error) {
      console.error("Failed to fetch coupons", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    util.setBarPageView("Coupon List");
    getCouponList(0);
  }, []);

  /**
   * 获取优惠券状态颜色
   */
  const getStatusColor = (tabIndex) => {
    switch (tabIndex) {
      case 0: return 'from-primary-500 to-primary-600'; // 可用 - 绿色
      case 1: return 'from-gray-400 to-gray-500';       // 已用 - 灰色
      case 2: return 'from-gray-300 to-gray-400';       // 过期 - 浅灰色
      default: return 'from-primary-500 to-primary-600';
    }
  };

  /**
   * 获取按钮文本
   */
  const getButtonText = (tabIndex) => {
    switch (tabIndex) {
      case 0: return t("common_page.use_now", "ใช้งาน");
      case 1: return t("common_page.coupon_tab.used", "ใช้แล้ว");
      case 2: return t("common_page.coupon_tab.expired", "หมดอายุ");
      default: return t("common_page.use_now", "ใช้งาน");
    }
  };

  return (
    <div className="coupon-page pb-24">
      {/* Header */}
      <div className="coupon-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="header-title">{t("common_page.coupon_title", "คูปอง")}</h1>
        <div className="w-6"></div>
      </div>

      {/* Tabs - LINE Theme */}
      <div className="coupon-tabs">
        <button
          className={`tab-btn ${tab === 0 ? "active" : ""}`}
          onClick={() => {
            setTab(0);
            getCouponList(0);
          }}
        >
          {t("common_page.coupon_tab.unused", "ยังไม่ได้ใช้")}
        </button>
        <button
          className={`tab-btn ${tab === 1 ? "active" : ""}`}
          onClick={() => {
            setTab(1);
            getCouponList(1);
          }}
        >
          {t("common_page.coupon_tab.used", "ใช้แล้ว")}
        </button>
        <button
          className={`tab-btn ${tab === 2 ? "active" : ""}`}
          onClick={() => {
            setTab(2);
            getCouponList(2);
          }}
        >
          {t("common_page.coupon_tab.expired", "หมดอายุ")}
        </button>
      </div>

      {/* Coupon List */}
      <div className="coupon-list">
        {loading ? (
          <Loading />
        ) : list.length > 0 ? (
          list.map((item, index) => (
            <div
              key={index}
              className={`coupon-card bg-gradient-to-r ${getStatusColor(tab)} ${tab === 0 ? 'active' : 'inactive'
                }`}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="coupon-content">
                {/* 左侧：优惠信息 */}
                <div className="coupon-info">
                  <div className="discount-amount">
                    {item.discount}
                  </div>
                  <div className="coupon-name">
                    {item.name}
                  </div>
                  {item.min_amount && (
                    <div className="min-amount">
                      ขั้นต่ำ ฿{item.min_amount}
                    </div>
                  )}
                  <div className="expire-time">
                    หมดอายุ: {item.expire_time || item.create_time}
                  </div>
                </div>

                {/* 右侧：使用按钮 */}
                <div className="coupon-action">
                  {/* 半圆切口 */}
                  <div className="circle-cutout circle-top"></div>
                  <div className="circle-cutout circle-bottom"></div>

                  <button
                    disabled={tab !== 0}
                    className={`use-btn ${tab === 0 ? 'active' : 'disabled'}`}
                  >
                    {getButtonText(tab)}
                  </button>
                </div>
              </div>

              {/* 虚线分隔 */}
              <div className="dashed-line"></div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <p className="empty-text">{t("common.no_data", "ไม่มีคูปอง")}</p>
          </div>
        )}
      </div>
      <Tab />
    </div>
  );
};

export default CommonCouponPage;