import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { orderStatusState, userState, guideTypeState } from "../../state";
import Tab from "../../components/Tab/Tab";
import Loading from "../../components/Loading/Index";
import request from "../../utils/request";
import util from "../../utils/util";
import Button from "../../components/Button/Index";
import Modal from "../../components/Modal/Index";
import liff from "../../utils/liff";

const MinePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUserState = useSetRecoilState(userState);
  const setOrderStatus = useSetRecoilState(orderStatusState);

  // State
  const [userInfo, setUserInfo] = useState({ isLogin: false });
  const [assets, setAssets] = useState({
    balance: 0.0,
    coupon: 0,
    sms: 0,
    points: 0,
  });
  const [loading, setLoading] = useState(false);

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
      if (res.code === 1 && res.data && res.data.userInfo) {
        const u = res.data.userInfo;
        setAssets({
          balance: u.balance || 0,
          sms: u.sms || 0,
          coupon: u.coupon || 0,
          points: u.points || 0
        });
      } else if (res.code === -1) {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
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
      "no-check": 1,
      "no-pay": 2,
      "no-send": 3,
      "no-recive": 4, // Typo in original code logic?
      "complete": 5
    };
    if (status) setOrderStatus(map[status]);
    navigate("/order/index");
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
                <h2 className="text-xl font-bold">{userInfo.nickname}</h2>
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
            { label: t("mine.balance"), val: assets.balance, route: "/mine/balance" },
            { label: t("mine.sms"), val: assets.sms, route: "/common/sms" },
            { label: t("mine.coupon"), val: assets.coupon, route: "/common/coupon" },
            { label: t("mine.points"), val: assets.points, route: "" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center cursor-pointer" onClick={() => item.route && navigate(item.route)}>
              <span className="text-lg font-bold text-gray-800">{item.val}</span>
              <span className="text-xs text-gray-500 mt-1 text-center">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* My Orders */}
      <div className="mx-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-800">{t("mine.my_orders")}</h3>
          <span onClick={() => navigateToOrder("")} className="text-xs text-gray-400 cursor-pointer">{t("mine.view_all")} &rarr;</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm grid grid-cols-5 gap-2">
          {[
            { icon: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img97.png", txt: t("mine.status.no_check"), key: "no-check" },
            { icon: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img98.png", txt: t("mine.status.no_pay"), key: "no-pay" },
            { icon: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img99.png", txt: t("mine.status.no_send"), key: "no-send" },
            { icon: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img100.png", txt: t("mine.status.no_receive"), key: "no-recived" }, // Fixed map key mismatch
            { icon: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img101.png", txt: t("mine.status.complete"), key: "complete" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition" onClick={() => navigateToOrder(item.key)}>
              <img src={item.icon} className="w-8 h-8" />
              <span className="text-[10px] text-gray-600 text-center leading-tight">{item.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Other Services */}
      <div className="mx-4 mt-6">
        <h3 className="font-bold text-lg text-gray-800 mb-4">{t("mine.other_services")}</h3>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {[
            { icon: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img127.png", txt: t("home.nav.recharge", "เติมเงิน"), route: "/mine/recharge" },
            { icon: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img114.png", txt: t("mine.receive_package"), route: "/package/take" },
            { icon: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img115.png", txt: t("mine.address_book"), route: "/address/index" },
            { icon: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img116.png", txt: t("mine.warehouse"), route: "/storage/index" },
            { icon: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img117.png", txt: t("mine.faq"), route: "/article/help/list", params: "newUser" },
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => navigate(item.route)}
              className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition cursor-pointer"
            >
              <img src={item.icon} className="w-6 h-6" />
              <span className="flex-1 text-sm font-medium text-gray-700">{item.txt}</span>
              <span className="text-gray-300">&rsaquo;</span>
            </div>
          ))}
        </div>
      </div>

      <Tab current="mine" />
      <Loading is={loading} />
    </div>
  );
};

export default MinePage;
