import React, { useEffect, useState, useMemo } from "react";
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
import Banner from "./components/Banner";
import NavigationMenu from "./components/NavigationMenu";
import QuickGuide from "./components/QuickGuide";
import {
  BellAlertIcon,
  CubeIcon,
  CalculatorIcon,
  CreditCardIcon,
  InboxArrowDownIcon,
  ArchiveBoxIcon,
  TicketIcon,
  BuildingStorefrontIcon,
  QuestionMarkCircleIcon
} from "./components/Icons";

const HomePage = () => {
  const { t } = useTranslation();
  const setGuideId = useSetRecoilState(guideTypeState); // Retained as it was in original, though not explicitly in new snippet's diff
  const setLineId = useSetRecoilState(lineIdState); // Retained as it was in original, though not explicitly in new snippet's diff
  const setOrderStatus = useSetRecoilState(orderStatusState);
  const setFormReportData = useSetRecoilState(reportFormState);
  const setFormReportType = useSetRecoilState(reportFormTypeState);

  const navigate = useNavigate();
  const [course, setCourse] = useState([]);
  const [warehouse, setWarehouse] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerContact, setCustomerContact] = useState({});

  // 导航数据 - 使用 SVG 图标组件
  const navData = useMemo(() => [
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
  ], [t]);

  const menuTarget = (url, params) => {
    if (params) setOrderStatus(params);
    navigate(url);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannerRes, contactRes] = await Promise.all([
          request.get("page/banner&wxapp_id=10001", null, { cache: true, ttl: 300000 }), // Cache 5 min
          request.get("page/customer_contact&wxapp_id=10001", null, { cache: true, ttl: 600000 }) // Cache 10 min
        ]);

        setCourse(bannerRes.data || []);
        setCustomerContact(contactRes.data || {});

        // Note: Removed 'goods_line' and 'hotComment' fetches as they seemed unused in the visible UI, 
        // or were only for internal state that wasn't rendered. I didn't see them passed to components.
        // bestLine and comment states were unused in the original extracted code logic.
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
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Banner course={course} />
      <NavigationMenu navData={navData} onMenuClick={menuTarget} />
      <QuickGuide
        warehouse={warehouse}
        isLoggedIn={isLoggedIn}
        customerContact={customerContact}
      />
      <Tab current="home" />
    </div>
  );
};

export default HomePage;