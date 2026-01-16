import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";
import {
  guideTypeState,
  lineIdState,
  reportFormState,
  orderStatusState,
  reportFormTypeState,
  userState,
} from "../../state";
import Tab from "../../components/Tab/Tab";
import CustomerContact from "../../components/CustomerContact/Index";
import request from "../../utils/request";
import util from "../../utils/util";
import copy from "copy-to-clipboard";
import { toast } from "../../utils/toast.jsx";
import "./Index.scss";

// SVG 图标组件 - 使用 Heroicons 风格
const BellAlertIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const CubeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const CalculatorIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const CreditCardIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const InboxArrowDownIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
  </svg>
);

const ArchiveBoxIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

const TicketIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

const BuildingStorefrontIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
  </svg>
);

const QuestionMarkCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// LINE 主题菜单项组件 - 使用 SVG 图标
const MenuItem = ({ icon: IconComponent, text, onClick, gradient = "from-primary-400 to-primary-500", badge }) => (
  <div
    className="flex flex-col items-center gap-2 cursor-pointer group"
    onClick={onClick}
  >
    <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient}
                    flex items-center justify-center overflow-hidden
                    shadow-lg group-hover:shadow-xl group-hover:scale-105
                    group-active:scale-95 transition-all duration-200`}>
      <IconComponent className="w-8 h-8 text-white" />

      {badge && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white
                      text-[10px] font-bold px-1.5 py-0.5 rounded-full
                      shadow-lg animate-pulse">
          {badge}
        </div>
      )}
    </div>

    <span className="text-[11px] font-bold text-gray-700 text-center leading-tight
                   group-hover:text-primary-600 transition-colors">
      {text}
    </span>
  </div>
);

const HomePage = () => {
  const { t } = useTranslation();
  const setGuideId = useSetRecoilState(guideTypeState);
  const setOrderStatus = useSetRecoilState(orderStatusState);
  const setLineId = useSetRecoilState(lineIdState);
  const setFormReportData = useSetRecoilState(reportFormState);
  const setFormReportType = useSetRecoilState(reportFormTypeState);
  const user = useRecoilValue(userState);

  const navigate = useNavigate();
  const [bestLine, setBestLine] = useState([]);
  const [course, setCourse] = useState([]);
  const [comment, setComment] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [warehouse, setWarehouse] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerContact, setCustomerContact] = useState({});

  const handleCopy = (text) => {
    copy(text);
    toast.success(t("common.copy_success", "คัดลอกสำเร็จ"));
  };

  // 将数字转换为中文数字
  const convertNumberToChinese = (num) => {
    const chineseNumbers = {
      '0': '零', '1': '一', '2': '二', '3': '三', '4': '四',
      '5': '五', '6': '六', '7': '七', '8': '八', '9': '九'
    };
    return String(num).split('').map(digit => chineseNumbers[digit] || digit).join('');
  };

  const handleCopyAddress = (type) => {
    if (!warehouse) return;
    
    // 后端返回的字段：linkman, phone, address, post
    let name = warehouse.linkman || warehouse.name || '';
    const phone = warehouse.phone || '';
    let address = warehouse.address || '';
    const postCode = warehouse.post || warehouse.code || '';
    
    // 只转换地址中的数字ID为中文，联系人保持原样
    const convertIdToChinese = (text) => {
      return text.replace(/(\d+)/g, (match) => {
        // 只转换4-6位数字（用户ID格式）
        if (match.length >= 4 && match.length <= 6) {
          return convertNumberToChinese(match);
        }
        return match;
      });
    };
    
    // 只转换地址，不转换联系人
    address = convertIdToChinese(address);
    
    // 将地址中的"UID"替换为中文"用户ID"
    address = address.replace(/UID:/g, '用户ID:').replace(/UID /g, '用户ID ');
    
    const addressText = type === 'sea' 
      ? `${name}|${phone}|${address} SEA|${postCode}`
      : `${name}|${phone}|${address}|${postCode}`;
    
    copy(addressText);
    toast.success(t("common.copy_success", "คัดลอกสำเร็จ"));
  };

  // 导航数据 - 使用 SVG 图标组件
  const navData = [
    {
      id: 0,
      name: t("home.nav.report", "แจ้งพัสดุ"),
      icon: BellAlertIcon,
      url: "/package/forecast",
      gradient: "from-primary-400 to-primary-500"
    },
    {
      id: 1,
      name: t("home.nav.my_package", "พัสดุของฉัน"),
      icon: CubeIcon,
      url: "/order/package",
      gradient: "from-blue-400 to-blue-500"
    },
    {
      id: 2,
      name: t("home.nav.freight", "คำนวณค่าขนส่ง"),
      icon: CalculatorIcon,
      url: "/freight",
      gradient: "from-teal-400 to-teal-500"
    },
    {
      id: 3,
      name: t("home.nav.pending_pay", "รอชำระเงิน"),
      icon: CreditCardIcon,
      url: "/order/index",
      params: 2,
      gradient: "from-yellow-400 to-yellow-500"
    },
    {
      id: 4,
      name: t("home.nav.take", "รับพัสดุ"),
      icon: InboxArrowDownIcon,
      url: "/package/take",
      gradient: "from-pink-400 to-pink-500",
      badge: "ใหม่"
    },
    {
      id: 5,
      name: t("home.nav.pack", "สมัครแพ็คพัสดุ"),
      icon: ArchiveBoxIcon,
      url: "/package/pack/select",
      gradient: "from-emerald-400 to-emerald-500",
      badge: "ใหม่"
    },
    {
      id: 6,
      name: t("home.nav.coupon", "คูปอง"),
      icon: TicketIcon,
      url: "/common/coupon",
      gradient: "from-purple-400 to-purple-500",
      badge: "ใหม่"
    },
    {
      id: 7,
      name: t("home.nav.storage", "รายการคลังสินค้า"),
      icon: BuildingStorefrontIcon,
      url: "/storage/index",
      gradient: "from-indigo-400 to-indigo-500"
    },
    {
      id: 8,
      name: t("home.nav.freight", "คำนวณค่าขนส่ง"),
      icon: CalculatorIcon,
      url: "/freight",
      gradient: "from-teal-400 to-teal-500"
    },
    {
      id: 9,
      name: t("home.nav.helper", "คู่มือการใช้งาน"),
      icon: QuestionMarkCircleIcon,
      url: "/article/help/order",
      gradient: "from-cyan-400 to-cyan-500"
    },
  ];

  const menuTarget = (url, params) => {
    if (params) setOrderStatus(params);
    navigate(url);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lineRes, bannerRes, commentRes, contactRes] = await Promise.all([
          request.get("page/goods_line&wxapp_id=10001"),
          request.get("page/banner&wxapp_id=10001"),
          request.get("comment/hotComment&wxapp_id=10001"),
          request.get("page/customer_contact&wxapp_id=10001")
        ]);

        setBestLine(lineRes.data || []);
        setCourse(bannerRes.data || []);
        setComment(commentRes.data || []);
        setCustomerContact(contactRes.data || {});
      } catch (err) {
        console.error("Home data fetch error:", err);
      }
    };

    // 检查登录状态并获取仓库信息
    const checkLoginAndFetchWarehouse = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      console.log("🔍 Checking login status - token:", token ? "exists" : "missing", "userId:", userId);
      
      if (token && userId) {
        setIsLoggedIn(true);
        console.log("✅ User is logged in, fetching warehouse...");
        try {
          const res = await request.get("page/getStorageFirst&wxapp_id=10001");
          console.log("📦 Warehouse API response:", res);
          if (res.data) {
            setWarehouse(res.data);
            console.log("✅ Warehouse data set:", res.data);
          }
        } catch (err) {
          console.error("❌ Warehouse fetch error:", err);
        }
      } else {
        setIsLoggedIn(false);
        console.log("❌ User not logged in");
      }
    };

    fetchData();
    checkLoginAndFetchWarehouse();
    setFormReportData("");
    setFormReportType("normal");
  }, []); // Remove user dependency since we check localStorage directly

  // 轮播自动切换
  useEffect(() => {
    if (course.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % course.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [course.length]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Banner Section - LINE 主题绿色渐变 */}
      <div className="relative h-56 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 overflow-hidden">
        {/* 装饰性背景图案 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* 轮播图 */}
        {course.length > 0 && (
          <div className="flex overflow-x-auto snap-x h-full hide-scrollbar">
            {course.map((item, index) => (
              <img
                key={index}
                src={item["image"]["file_path"]}
                className="w-full h-full object-cover snap-center shrink-0"
                alt="banner"
              />
            ))}
          </div>
        )}

        {/* 指示器 */}
        {course.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {course.map((_, idx) => (
              <div 
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentBanner 
                    ? 'w-8 bg-white' 
                    : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation Menu - LINE 风格 */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="bg-white p-5 rounded-3xl shadow-2xl border border-gray-50 mb-4">
          <div className="grid grid-cols-4 gap-4">
            {navData.slice(0, 8).map((item) => (
              <MenuItem
                key={item.id}
                icon={item.icon}
                text={item.name}
                gradient={item.gradient}
                badge={item.badge}
                onClick={() => menuTarget(item.url, item.params)}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <MenuItem
            key={navData[8].id}
            icon={navData[8].icon}
            text={navData[8].name}
            gradient={navData[8].gradient}
            onClick={() => menuTarget(navData[8].url, navData[8].params)}
          />
        </div>
      </div>

      {/* Quick Guide Steps - 快速指南步骤 */}
      <div className="mt-8 px-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">{t("home.quick_guide", "คู่มือด่วน")}</h2>
        </div>

        <div className="space-y-3">
          {/* Step 1 */}
          <div 
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600
                            flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                📦
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                                flex items-center justify-center text-white font-bold text-xs">
                    1
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{t("guide.step1.title")}</h3>
                </div>
                <p className="text-gray-600 text-xs mb-3">{t("guide.step1.description")}</p>
                
                {/* 仓库地址信息 - 只在登录后显示 */}
                {isLoggedIn && warehouse ? (
                  <div className="space-y-2">
                    {/* 仓库信息 */}
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <div className="text-xs text-blue-600 font-medium mb-2">
                        {t("guide.step1.warehouse_info", "ข้อมูลคลังสินค้า")}
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex">
                          <span className="text-gray-500 w-16">{t("guide.step1.name", "ชื่อ")}:</span>
                          <span className="text-gray-800 font-medium">
                            {warehouse.linkman || warehouse.name}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 w-16">{t("guide.step1.phone", "โทร")}:</span>
                          <span className="text-gray-800 font-medium">{warehouse.phone}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 w-16">{t("guide.step1.address", "ที่อยู่")}:</span>
                          <span className="text-gray-800 font-medium">
                            {(() => {
                              const chineseNumbers = {
                                '0': '零', '1': '一', '2': '二', '3': '三', '4': '四',
                                '5': '五', '6': '六', '7': '七', '8': '八', '9': '九'
                              };
                              const text = warehouse.address || '';
                              return text.replace(/(\d+)/g, (match) => {
                                if (match.length >= 4 && match.length <= 6) {
                                  return match.split('').map(d => chineseNumbers[d] || d).join('');
                                }
                                return match;
                              }).replace(/UID:/g, '用户ID:').replace(/UID /g, '用户ID ');
                            })()}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 w-16">{t("guide.step1.zipcode", "รหัสไปรษณีย์")}:</span>
                          <span className="text-gray-800 font-medium">{warehouse.post || warehouse.code}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 复制按钮 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyAddress('land')}
                        className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                                 rounded-xl text-xs font-bold shadow-md
                                 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all
                                 flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {t("guide.step1.copy_land", "คัดลอกที่อยู่ทางบก")}
                      </button>
                      <button
                        onClick={() => handleCopyAddress('sea')}
                        className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white 
                                 rounded-xl text-xs font-bold shadow-md
                                 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all
                                 flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {t("guide.step1.copy_sea", "คัดลอกที่อยู่ทางเรือ")}
                      </button>
                    </div>
                    
                    {/* 提示信息 */}
                    <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                      <p className="text-[10px] text-blue-600 leading-relaxed">
                        💡 {t("guide.step1.notice", "ที่อยู่ทางเรือจะมีคำว่า 'SEA' ต่อท้าย")}
                      </p>
                    </div>
                  </div>
                ) : !isLoggedIn ? (
                  <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                    <p className="text-xs text-yellow-700 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      {t("guide.step1.login_required", "กรุณาเข้าสู่ระบบเพื่อดูที่อยู่คลังสินค้า")}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div 
            onClick={() => navigate('/guide/quick-start')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100
                     hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600
                            flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                📋
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600
                                flex items-center justify-center text-white font-bold text-xs">
                    2
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{t("guide.step2.title")}</h3>
                </div>
                <p className="text-gray-600 text-xs">{t("guide.step2.description")}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Step 3 */}
          <div 
            onClick={() => navigate('/guide/quick-start')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100
                     hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600
                            flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                📦
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600
                                flex items-center justify-center text-white font-bold text-xs">
                    3
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{t("guide.step3.title")}</h3>
                </div>
                <p className="text-gray-600 text-xs">{t("guide.step3.description")}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Step 4 */}
          <div 
            onClick={() => navigate('/guide/quick-start')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100
                     hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600
                            flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                💳
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600
                                flex items-center justify-center text-white font-bold text-xs">
                    4
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{t("guide.step4.title")}</h3>
                </div>
                <p className="text-gray-600 text-xs">{t("guide.step4.description")}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Service - LINE 主题优化 */}
      <div className="mt-8 px-4 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">{t("home.labels.service", "ฝ่ายบริการลูกค้า")}</h2>
        </div>

        {/* 使用 CustomerContact 组件 */}
        <CustomerContact config={customerContact} />
      </div>

      {/* Bottom Navigation */}
      <Tab current="home" />
    </div>
  );
};

export default HomePage;