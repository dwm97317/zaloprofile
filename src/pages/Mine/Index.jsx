import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { orderStatusState, userState, guideTypeState, userGradeState, userExpendState, gradeListState } from "../../state";
import Tab from "../../components/Tab/Tab";
import Loading from "../../components/Loading/Index";
import request from "../../utils/request";
import util from "../../utils/util";
import Button from "../../components/Button/Index";
import Modal from "../../components/Modal/Index";
import liff from "../../utils/liff";
import { GradeBadge } from "../../components/Grade";
import { DEFAULT_GRADE, PRESET_GRADES } from "../../utils/gradeUtils";

// SVG 图标组件 - Heroicons 风格
const ClipboardCheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const CreditCardIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const TruckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BanknoteIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InboxArrowDownIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
  </svg>
);

const MapPinIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BuildingStorefrontIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
  </svg>
);

const QuestionMarkCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BellIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const TicketIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

const MinePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUserState = useSetRecoilState(userState);
  const setOrderStatus = useSetRecoilState(orderStatusState);
  const setUserGrade = useSetRecoilState(userGradeState);
  const setUserExpend = useSetRecoilState(userExpendState);
  const setGradeList = useSetRecoilState(gradeListState);

  // State
  const [userInfo, setUserInfo] = useState({ isLogin: false });
  const [assets, setAssets] = useState({
    balance: 0.0,
    coupon: 0,
    sms: 0,
    points: 0,
  });
  const [grade, setGrade] = useState(null);
  const [expendMoney, setExpendMoney] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userMarks, setUserMarks] = useState([]);

  useEffect(() => {
    initMine();
  }, []);

  const initMine = async () => {
    // Build user info from localStorage
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    let profile = {};
    try {
      // Check if LIFF is initialized before calling isLoggedIn
      if (liff.isInClient && liff.isLoggedIn && liff.isLoggedIn()) {
        profile = await liff.getProfile();
      }
    } catch (e) {
      // Suppress LIFF errors in development mode
      console.warn("LIFF not available:", e.message);
    }

    const currentUser = {
      isLogin: !!token,
      user_id: userId,
      token: token,
      nickname: profile.displayName || "Guest",
      avatarUrl: profile.pictureUrl || "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img19.png"
    };

    setUserInfo(currentUser);

    if (currentUser.isLogin) {
      fetchUserAssets();
    }
  };

  const fetchUserAssets = async () => {
    try {
      const res = await request.post("user/detail&wxapp_id=10001");
      console.log('📊 用户详情API响应:', res);
      
      if (res.code === 1 && res.data && res.data.userInfo) {
        const u = res.data.userInfo;
        
        // 解析余额 - 确保转换为数字
        const balance = parseFloat(u.balance) || 0;
        const sms = parseInt(u.sms) || 0;
        const coupon = parseInt(u.coupon) || 0;
        const points = parseInt(u.points) || 0;
        
        console.log('💰 余额数据:', {
          原始balance: u.balance,
          解析后balance: balance,
          类型: typeof u.balance,
          sms, coupon, points
        });
        
        setAssets({
          balance: balance,
          sms: sms,
          coupon: coupon,
          points: points
        });
        
        // 提取唛头信息
        setUserMarks(u.usermark || []);
        
        // 提取等级信息
        const userGrade = u.grade || DEFAULT_GRADE;
        const userExpend = parseFloat(u.expend_money) || 0;
        
        setGrade(userGrade);
        setExpendMoney(userExpend);
        setUserGrade(userGrade);
        setUserExpend(userExpend);
        setGradeList(PRESET_GRADES);
      } else if (res.code === -1) {
        console.error('❌ API返回错误，需要重新登录');
        handleLogout();
      } else {
        console.error('❌ API返回异常:', res);
      }
    } catch (err) {
      console.error('❌ 获取用户资产失败:', err);
      // API 错误时使用默认等级
      setGrade(DEFAULT_GRADE);
      setExpendMoney(0);
      setUserGrade(DEFAULT_GRADE);
      setUserExpend(0);
    }
  };

  const handleLogin = async () => {
    try {
      if (liff.isInClient && liff.login) {
        if (!liff.isLoggedIn || !liff.isLoggedIn()) {
          liff.login();
        } else {
          // Force re-auth logic if needed or just reload
          window.location.reload();
        }
      } else {
        console.warn("LIFF not available in development mode");
      }
    } catch (e) {
      console.warn("LIFF login error:", e.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    try {
      if (liff.isInClient && liff.isLoggedIn && liff.isLoggedIn()) {
        liff.logout();
      }
    } catch (e) {
      console.warn("LIFF logout error:", e.message);
    }
    setUserInfo({ isLogin: false });
    setAssets({ balance: 0, sms: 0, coupon: 0, points: 0 });
    window.location.reload();
  };

  const navigateToOrder = (status) => {
    const map = {
      "all": 0,           // 全部
      "no-check": 1,      // 待查验
      "no-pay": 2,        // 待支付
      "no-send": 3,       // 待发货
      "no-receive": 4,    // 待收货 -> 对应已发货状态(6)
      "complete": 5       // 已完成
    };
    // 设置订单状态，如果是undefined则设置为0（全部）
    setOrderStatus(status !== undefined ? map[status] : 0);
    navigate("/order/index");
  };

  const handleGradeClick = () => {
    navigate("/grade/index");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-400 pb-16 pt-10 px-6 rounded-b-[40px] shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
            <img src={userInfo.avatarUrl} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-white">
            {userInfo.isLogin ? (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{userInfo.nickname}</h2>
                  {grade && (
                    <GradeBadge 
                      grade={grade} 
                      size="sm" 
                      showName={false}
                      onClick={handleGradeClick}
                    />
                  )}
                </div>
                <p className="text-blue-100 text-sm mt-1">{t("mine.user_code")}: {userInfo.user_id}</p>
              </>
            ) : (
              <h2 className="text-xl font-bold" onClick={handleLogin}>{t("mine.login_prompt")} &rarr;</h2>
            )}
          </div>
        </div>

        {/* Login/Logout Button */}
        <div className="absolute top-6 right-6">
          {userInfo.isLogin ? (
            <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-xs transition">
              {t("mine.logout")}
            </button>
          ) : (
            <button onClick={handleLogin} className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
              {t("mine.login")}
            </button>
          )}
        </div>
      </div>

      {/* Assets Card */}
      {userInfo.isLogin && (
        <div className="mx-4 -mt-10 bg-white rounded-2xl shadow-lg p-6 grid grid-cols-4 gap-2 relative z-10">
          {[
            { 
              label: t("mine.balance"), 
              val: typeof assets.balance === 'number' ? assets.balance.toFixed(2) : '0.00',
              unit: '฿',
              route: "/mine/balance" 
            },
            { label: t("mine.sms"), val: assets.sms, route: "/message/index" },
            { label: t("mine.coupon"), val: assets.coupon, route: "/common/coupon" },
            { label: t("mine.points"), val: assets.points, route: "" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center cursor-pointer" onClick={() => item.route && navigate(item.route)}>
              <span className="text-lg font-bold text-gray-800">{item.val}</span>
              {item.unit && <span className="text-xs text-gray-500">{item.unit}</span>}
              {!item.unit && <span className="text-xs text-gray-500 mt-1 text-center">{item.label}</span>}
              {item.unit && <span className="text-xs text-gray-500 text-center">{item.label}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Mark Entry - 只有有唛头时才显示 */}
      {userInfo.isLogin && userMarks.length > 0 && (
        <div 
          onClick={() => navigate('/mark')}
          className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between
                     active:scale-[0.98] transition-transform cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🏷️</span>
            <span className="font-medium text-gray-800">{t("mark.my_marks", "我的唛头")}</span>
          </div>
          <span className="text-gray-400">&rsaquo;</span>
        </div>
      )}

      {/* My Orders */}
      <div className="mx-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-800">{t("mine.my_orders")}</h3>
          <span onClick={() => navigateToOrder("all")} className="text-xs text-gray-400 cursor-pointer">{t("mine.view_all")} &rarr;</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm grid grid-cols-5 gap-2">
          {[
            { icon: ClipboardCheckIcon, txt: t("mine.status.no_check"), key: "no-check", color: "text-blue-500" },
            { icon: CreditCardIcon, txt: t("mine.status.no_pay"), key: "no-pay", color: "text-yellow-500" },
            { icon: TruckIcon, txt: t("mine.status.no_send"), key: "no-send", color: "text-orange-500" },
            { icon: TruckIcon, txt: t("mine.status.no_receive"), key: "no-receive", color: "text-purple-500" },
            { icon: CheckCircleIcon, txt: t("mine.status.complete"), key: "complete", color: "text-green-500" },
          ].map((item, i) => {
            const IconComponent = item.icon;
            return (
              <div key={i} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition group" onClick={() => navigateToOrder(item.key)}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 
                                flex items-center justify-center
                                group-hover:shadow-md transition-shadow ${item.color}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-[10px] text-gray-600 text-center leading-tight">{item.txt}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Other Services */}
      <div className="mx-4 mt-6">
        <h3 className="font-bold text-lg text-gray-800 mb-4">{t("mine.other_services")}</h3>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {[
            { icon: BellIcon, txt: t("mine.messages", "ข้อความ"), route: "/message/index", color: "text-blue-600" },
            { icon: BanknoteIcon, txt: t("home.nav.recharge", "เติมเงิน"), route: "/mine/recharge", color: "text-green-600" },
            { icon: TicketIcon, txt: t("mine.coupon_center", "领券中心"), route: "/coupon/center", color: "text-orange-600" },
            { icon: InboxArrowDownIcon, txt: t("mine.receive_package"), route: "/package/take", color: "text-pink-600" },
            { icon: MapPinIcon, txt: t("mine.address_book"), route: "/address/index", color: "text-red-600" },
            { icon: BuildingStorefrontIcon, txt: t("mine.warehouse"), route: "/storage/index", color: "text-indigo-600" },
            { icon: QuestionMarkCircleIcon, txt: t("mine.faq"), route: "/article/help/list", params: "newUser", color: "text-cyan-600" },
          ].map((item, i) => {
            const IconComponent = item.icon;
            return (
              <div
                key={i}
                onClick={() => navigate(item.route)}
                className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 
                                flex items-center justify-center flex-shrink-0
                                group-hover:shadow-md transition-shadow ${item.color}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-700">{item.txt}</span>
                <span className="text-gray-300">&rsaquo;</span>
              </div>
            );
          })}
        </div>
      </div>

      <Tab current="mine" />
      <Loading is={loading} />
    </div>
  );
};

export default MinePage;
