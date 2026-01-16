import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSetRecoilState } from "recoil";
import { packageStatusState } from "../../state";

// SVG 图标组件 - Heroicons 风格
const HomeIcon = ({ active, className }) => (
  <svg className={className} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} 
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const SearchIcon = ({ active, className }) => (
  <svg className={className} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} 
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BoxIcon = ({ active, className }) => (
  <svg className={className} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} 
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const UserIcon = ({ active, className }) => (
  <svg className={className} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} 
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LightningIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
  </svg>
);

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
      icon: HomeIcon,
    },
    {
      id: "query",
      path: "/query",
      label: t("tab.query"),
      icon: SearchIcon,
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
      icon: BoxIcon,
      onClick: () => {
        setPackageStatus(2); // Set to received status
        navigate("/order/package");
      }
    },
    {
      id: "mine",
      path: "/mine",
      label: t("tab.mine"),
      icon: UserIcon,
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
                  <LightningIcon className="w-7 h-7 text-white" />
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
        const IconComponent = tab.icon;

        return (
          <div
            key={index}
            onClick={() => tab.onClick ? tab.onClick() : navigate(tab.path)}
            className={`flex flex-col items-center justify-center w-full h-full cursor-pointer pb-1 transition-colors ${
              active ? "text-primary-600" : "text-gray-400"
            }`}
          >
            <IconComponent active={active} className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Tab;