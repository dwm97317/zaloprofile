import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { orderIdState, orderStatusState } from "../../state";
import request from "../../utils/request";
import { toast } from "../../utils/toast";
import Loading from "../../components/Loading/Index";
import EnhancedOrderListCard from "../../components/Order/EnhancedOrderListCard";
import Tab from "../../components/Tab/Tab";

const OrderListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setOrderId = useSetRecoilState(orderIdState);
  const orderStatus = useRecoilValue(orderStatusState);

  const [activeTab, setActiveTab] = useState(1);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [cancelId, setCancelId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const typeMap = ["", "verify", "nopay", "no_send", "send", "complete"];

  useEffect(() => {
    // Init tab from global state or default
    // 如果orderStatus为0，显示全部；否则使用orderStatus或默认为1
    const initialTab = orderStatus !== undefined ? orderStatus : 1;
    setActiveTab(initialTab);
    fetchOrderList(initialTab);
  }, []);

  const fetchOrderList = async (tabIndex) => {
    setLoading(true);
    try {
      const apiTab = typeMap[tabIndex] || "";
      const res = await request.get("package/packagelist&wxapp_id=10001", { type: apiTab });
      if (res.code === 1 && Array.isArray(res.data.data)) {
        setList(res.data.data);
      } else {
        setList([]);
      }
    } catch (err) {
      console.error(err);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
    fetchOrderList(index);
  };

  const handleCancelClick = (id) => {
    setCancelId(id);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    setShowCancelModal(false);
    setLoading(true);
    try {
      const res = await request.post("package/canclePack&wxapp_id=10001", { id: cancelId });
      if (res.code === 1) {
        toast.success(t("order.cancel_success", "ยกเลิกสำเร็จ"));
        fetchOrderList(activeTab);
      } else {
        toast.error(res.msg || t("common.error", "เกิดข้อผิดพลาด"));
      }
    } catch (err) {
      toast.error(t("common.error_network", "เกิดข้อผิดพลาดในการเชื่อมต่อ"));
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id) => {
    setLoading(true);
    setLoadingText(t("common.processing", "กำลังดำเนินการ..."));
    try {
      const res = await request.post("package/doPay&wxapp_id=10001", { id: id, paytype: 10 });
      if (res.code === 1) {
        toast.success(t("order.pay_success", "ชำระเงินสำเร็จ"));
        fetchOrderList(activeTab);
      } else {
        toast.error(res.msg || t("common.error", "เกิดข้อผิดพลาด"));
      }
    } catch (err) {
      toast.error(t("common.error_network", "เกิดข้อผิดพลาดในการเชื่อมต่อ"));
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const handleConfirmReceive = async (id) => {
    setLoading(true);
    setLoadingText(t("common.processing", "กำลังดำเนินการ..."));
    try {
      const res = await request.post("package/signedin&wxapp_id=10001", { id: id });
      if (res.code === 1) {
        toast.success(t("order.confirm_receive_success", "ยืนยันการรับสินค้าสำเร็จ"));
        // 更新订单状态为已完成(8)
        fetchOrderList(activeTab);
      } else {
        toast.error(res.msg || t("common.error", "เกิดข้อผิดพลาด"));
      }
    } catch (err) {
      toast.error(t("common.error_network", "เกิดข้อผิดพลาดในการเชื่อมต่อ"));
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const tabs = [
    { id: 0, label: t("order.tabs.all", "ทั้งหมด"), icon: "📋" },
    { id: 1, label: t("order.tabs.check", "ตรวจสอบ"), icon: "⏱️" },
    { id: 2, label: t("order.tabs.pay", "ชำระ"), icon: "💳" },
    { id: 3, label: t("order.tabs.send", "จัดส่ง"), icon: "📦" },
    { id: 4, label: t("order.tabs.sent", "ส่งแล้ว"), icon: "🚚" },
    { id: 5, label: t("order.tabs.done", "เสร็จสิ้น"), icon: "✅" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-20 flex items-center">
        <button onClick={() => navigate("/mine")} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">{t("order.title", "คำสั่งซื้อ")}</h1>
      </div>

      {/* Tabs - Enhanced with icons */}
      <div className="bg-white/80 backdrop-blur-lg shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide sticky top-[52px] z-10">
        <div className="flex px-2">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              whileTap={{ scale: 0.95 }}
              className={`
                px-4 py-3 text-sm font-medium transition-all cursor-pointer border-b-2 flex items-center gap-1.5
                ${activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 p-4 space-y-4">
        {list.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-gray-400"
          >
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-sm">{t("common.no_data", "ไม่มีข้อมูล")}</p>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {list.map((item, index) => (
            <EnhancedOrderListCard
              key={item.id || index}
              item={item}
              onDetail={(id) => {
                setOrderId(id);
                navigate("/order/detail");
              }}
              onCancel={handleCancelClick}
              onPay={handlePay}
              onConfirmReceive={handleConfirmReceive}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t("common.confirm", "ยืนยัน")}</h3>
              <p className="text-gray-600 mb-6 font-medium">
                {t("order.cancel_confirm", "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition active:scale-95"
                >
                  {t("common.cancel", "ยกเลิก")}
                </button>
                <button
                  onClick={confirmCancel}
                  className="w-full py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition shadow-lg shadow-red-200 active:scale-95"
                >
                  {t("common.confirm", "ยืนยัน")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Loading is={loading} text={loadingText} />
      <Tab />
    </div>
  );
};

export default OrderListPage;