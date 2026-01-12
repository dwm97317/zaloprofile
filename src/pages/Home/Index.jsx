import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import {
  guideTypeState,
  lineIdState,
  reportFormState,
  orderStatusState,
  reportFormTypeState,
} from "../../state";
import Tab from "../../components/Tab/Tab";
import request from "../../utils/request";
import util from "../../utils/util";
import copy from "copy-to-clipboard";
import { toast } from "../../utils/toast.jsx";
import "./Index.scss";

// LINE 主题菜单项组件
const MenuItem = ({ icon, text, onClick, gradient = "from-primary-400 to-primary-500", badge }) => (
  <div
    className="flex flex-col items-center gap-2 cursor-pointer group"
    onClick={onClick}
  >
    <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient}
                    flex items-center justify-center overflow-hidden
                    shadow-lg group-hover:shadow-xl group-hover:scale-110
                    group-active:scale-95 transition-all duration-200`}>
      <img
        src={icon}
        alt={text}
        className="w-8 h-8 object-contain"
      />

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

  const navigate = useNavigate();
  const [bestLine, setBestLine] = useState([]);
  const [course, setCourse] = useState([]);
  const [comment, setComment] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  const handleCopy = (text) => {
    copy(text);
    toast.success(t("common.copy_success", "คัดลอกสำเร็จ"));
  };

  // 导航数据 - 使用 LINE 主题渐变色
  const navData = [
    {
      id: 0,
      name: t("home.nav.report", "แจ้งพัสดุ"),
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img2.png",
      url: "/package/forecast",
      gradient: "from-primary-400 to-primary-500"
    },
    {
      id: 1,
      name: t("home.nav.my_package", "พัสดุของฉัน"),
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img3.png",
      url: "/order/package",
      gradient: "from-blue-400 to-blue-500"
    },
    {
      id: 2,
      name: t("home.nav.recharge", "เติมเงิน"),
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img127.png",
      url: "/mine/recharge",
      gradient: "from-orange-400 to-orange-500",
      badge: "ใหม่"
    },
    {
      id: 3,
      name: t("home.nav.pending_pay", "รอชำระเงิน"),
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img5.png",
      url: "/order/index",
      params: 2,
      gradient: "from-yellow-400 to-yellow-500"
    },
    {
      id: 4,
      name: t("home.nav.take", "รับพัสดุ"),
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img6.png",
      url: "/package/take",
      gradient: "from-pink-400 to-pink-500",
      badge: "ใหม่"
    },
    {
      id: 5,
      name: t("home.nav.pack", "สมัครแพ็คพัสดุ"),
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img8.png",
      url: "/package/pack/select",
      gradient: "from-emerald-400 to-emerald-500",
      badge: "ใหม่"
    },
    {
      id: 6,
      name: t("home.nav.coupon", "คูปอง"),
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img_coupon.png",
      url: "/common/coupon",
      gradient: "from-purple-400 to-purple-500",
      badge: "ใหม่"
    },
    {
      id: 7,
      name: t("home.nav.storage", "รายการคลังสินค้า"),
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img7.png",
      url: "/storage/index",
      gradient: "from-indigo-400 to-indigo-500"
    },
    {
      id: 8,
      name: t("home.nav.freight", "คำนวณค่าขนส่ง"),
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img9.png",
      url: "/freight",
      gradient: "from-teal-400 to-teal-500"
    },
    {
      id: 9,
      name: t("home.nav.helper", "คู่มือการใช้งาน"),
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img10.png",
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
        const [lineRes, bannerRes, commentRes] = await Promise.all([
          request.get("page/goods_line&wxapp_id=10001"),
          request.get("page/banner&wxapp_id=10001"),
          request.get("comment/hotComment&wxapp_id=10001")
        ]);

        setBestLine(lineRes.data || []);
        setCourse(bannerRes.data || []);
        setComment(commentRes.data || []);
      } catch (err) {
        console.error("Home data fetch error:", err);
      }
    };

    fetchData();
    setFormReportData("");
    setFormReportType("normal");
  }, []);

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
                icon={item.img}
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
            icon={navData[8].img}
            text={navData[8].name}
            gradient={navData[8].gradient}
            onClick={() => menuTarget(navData[8].url, navData[8].params)}
          />
        </div>

        {/* Quick Guide Entrance Button */}
        <div className="relative -top-5 flex items-center justify-center">
          <button
            onClick={() => navigate('/guide/quick-start')}
            className="group relative"
          >
            {/* Glow effect background */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 
                            rounded-full blur-xl opacity-50 group-hover:opacity-75 
                            transition-opacity animate-pulse" />
            
            {/* Main button */}
            <div className="relative flex items-center gap-3 px-6 py-3 
                            bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500
                            rounded-full shadow-2xl
                            group-hover:scale-110 group-active:scale-95
                            transition-all duration-200">
              <span className="text-2xl">⚡</span>
              <span className="text-white font-bold text-base">
                {t("home.quick_guide", "คู่มือด่วน")}
              </span>
              <span className="text-2xl">📋</span>
            </div>
            
            {/* Notification dot */}
            <div className="absolute -top-1 -right-1 w-3 h-3 
                            bg-red-500 rounded-full animate-ping" />
          </button>
        </div>
      </div>

      {/* Best Routes - LINE 主题优化 */}
      <div className="mt-8 px-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">{t("home.labels.best_route", "เส้นทางที่ดีที่สุด")}</h2>
        </div>

        <div className="space-y-4">
          {bestLine.map((lines, groupIdx) => (
            <div key={groupIdx} className="flex overflow-x-auto gap-4 py-2 hide-scrollbar">
              {lines.map((line, idx) => (
                <div
                  key={idx}
                  className="shrink-0 w-72 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden 
                           hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    setLineId(line.id);
                    navigate("/common/line/detail");
                  }}
                >
                  <img src={line.image || "https://zhuanyun.sllowly.cn/attachment/no_pic.png"} 
                       className="w-full h-32 object-cover" alt={line.name} />
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 truncate text-base">{line.name}</h4>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t("home.labels.delivery", "จัดส่ง")}:</span>
                        <span className="font-medium text-gray-800">{line.limitationofdelivery}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t("home.labels.tariff", "ภาษี")}:</span>
                        <span className="font-bold text-primary-600">{line.tariff}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-end text-primary-600 font-bold text-sm">
                      {t("common.view_detail", "ดูรายละเอียด")} →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Customer Service - LINE 主题优化 */}
      <div className="mt-8 px-4 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">{t("home.labels.service", "ฝ่ายบริการลูกค้า")}</h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {[
            { name: "Hotline (TH)", val: "+66 12345678", type: "call", icon: "📞" },
            { name: "LINE Support", val: "@vhunter", type: "copy", icon: "💬" },
            { name: "WeChat", val: "vhunter_service", type: "copy", icon: "💬" }
          ].map((srv, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100
                                  hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl 
                              flex items-center justify-center text-2xl">
                  {srv.icon}
                </div>
                <div>
                  <div className="font-bold text-base text-gray-800">{srv.name}</div>
                  <div className="text-sm text-gray-500 font-medium">{srv.val}</div>
                </div>
              </div>
              <button
                onClick={() => srv.type === 'call' ? window.open(`tel:${srv.val}`) : handleCopy(srv.val)}
                className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white 
                         rounded-xl text-sm font-bold shadow-lg shadow-green
                         hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                {srv.type === 'call' ? t("common.call_now", "โทรเลย") : t("common.copy", "คัดลอก")}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <Tab current="home" />
    </div>
  );
};

export default HomePage;