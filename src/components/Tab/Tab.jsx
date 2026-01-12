import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSetRecoilState } from "recoil";
import { packageStatusState } from "../../state";

const Tab = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const setPackageStatus = useSetRecoilState(packageStatusState);

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "/home";
    }
    return location.pathname.startsWith(path);
  };

  const tabs = [
    {
      id: "home",
      path: "/",
      label: t("tab.home"),
      iconActive: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_imgs11.png",
      iconInactive: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_imgs1.png",
    },
    {
      id: "query",
      path: "/query",
      label: t("tab.query"),
      iconActive: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_imgs22.png",
      iconInactive: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_imgs2.png",
    },
    {
      id: "center",
      path: "/guide/quick-start",
      isCenter: true,
      label: t("home.quick_guide", "คู่มือด่วน"),
    },
    {
      id: "packages",
      path: "/order/package",
      label: t("tab.received", "เข้าคลังแล้ว"),
      iconActive: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_imgs33.png",
      iconInactive: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_imgs3.png",
      onClick: () => {
        setPackageStatus(2); // Set to received status
        navigate("/order/package");
      }
    },
    {
      id: "mine",
      path: "/mine",
      label: t("tab.mine"),
      iconActive: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_imgs44.png",
      iconInactive: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_imgs4.png",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 flex items-end justify-between px-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)] h-[60px]">
      {tabs.map((tab, index) => {
        if (tab.isCenter) {
          return (
            <div 
              key={index} 
              onClick={() => navigate(tab.path)}
              className="relative -top-5 flex flex-col items-center justify-center cursor-pointer"
            >
              <button className="group relative">
                {/* Glow effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 
                                rounded-full blur-lg opacity-50 group-hover:opacity-75 
                                transition-opacity animate-pulse" />
                
                {/* Main button */}
                <div className="relative flex items-center justify-center w-14 h-14
                                bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500
                                rounded-full shadow-2xl
                                group-hover:scale-110 group-active:scale-95
                                transition-all duration-200">
                  <span className="text-2xl">⚡</span>
                </div>
                
                {/* Notification dot */}
                <div className="absolute -top-1 -right-1 w-3 h-3 
                                bg-red-500 rounded-full animate-ping" />
              </button>
              <span className="text-[10px] font-medium text-gray-700 mt-1">{tab.label}</span>
            </div>
          )
        }

        const active = isActive(tab.path);

        return (
          <div
            key={index}
            onClick={() => tab.onClick ? tab.onClick() : navigate(tab.path)}
            className={`flex flex-col items-center justify-center w-full h-full cursor-pointer pb-1 ${active ? "text-blue-600" : "text-gray-400"
              }`}
          >
            <div className="w-6 h-6 mb-1">
              <img
                src={active ? tab.iconActive : tab.iconInactive}
                alt={tab.label}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Tab;