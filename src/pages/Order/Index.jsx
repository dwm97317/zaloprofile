import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { orderIdState, orderStatusState } from "../../state";
import request from "../../utils/request";
import copy from "copy-to-clipboard";
import Button from "../../components/Button/Index";
import Modal from "../../components/Modal/Index";
import Loading from "../../components/Loading/Index";

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
    const initialTab = orderStatus || 1;
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

  const handleCopy = (text) => {
    if (copy(text)) {
      alert(t("common.copy_success"));
    }
  };

  const handleDetail = (id) => {
    setOrderId(id);
    navigate("/order/detail");
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
        alert(t("order.cancel_success"));
        fetchOrderList(activeTab); // Refresh list
      } else {
        alert(res.msg || t("common.error"));
      }
    } catch (err) {
      alert(t("common.error_network"));
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id) => {
    setLoading(true);
    setLoadingText(t("common.processing"));
    try {
      const res = await request.post("package/doPay&wxapp_id=10001", { id: id, paytype: 10 });
      if (res.code === 1) {
        alert(t("order.pay_success"));
        fetchOrderList(activeTab);
      } else {
        alert(res.msg || t("common.error"));
      }
    } catch (err) {
      alert(t("common.error_network"));
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  // Helper to get status text (can be improved with better mapping)
  const getStatusText = (item) => {
    const { status, is_pay } = item;
    if (status == 1) return t("order.status.pending_check");
    if (status == 2 && is_pay == 2) return t("order.status.pending_pay");
    if (status == 3 && is_pay == 1) return t("order.status.paid");
    if (status == 4 && is_pay == 1) return t("order.status.packing");
    if (status == 5 && is_pay == 1) return t("order.status.packing");
    if (status == 6 && is_pay == 1) return t("order.status.shipped");
    if (status == 7 && is_pay == 1) return t("order.status.received");
    if (status == 8 && is_pay == 1) return t("order.status.completed");
    if (status == -1) return t("order.status.cancelled");
    return "";
  };

  const tabs = [
    { id: "", label: t("order.tabs.all") },
    { id: 1, label: t("order.tabs.check") },
    { id: 2, label: t("order.tabs.pay") },
    { id: 3, label: t("order.tabs.send") },
    { id: 4, label: t("order.tabs.sent") },
    { id: 5, label: t("order.tabs.done") },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-20 flex items-center">
        <button onClick={() => navigate("/mine")} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">{t("order.title")}</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide sticky top-[52px] z-10">
        <div className="flex px-2">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 p-4 space-y-4">
        {list.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p>{t("common.no_data")}</p>
          </div>
        )}

        {list.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header: Warehouse & Status */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 p-1.5 rounded-lg">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img24.png" className="w-4 h-4" />
                </span>
                <span className="font-bold text-gray-800 text-sm">
                  {item.storage?.shop_name || "Warehouse"}
                </span>
              </div>
              <span className="text-orange-500 font-bold text-sm">
                {getStatusText(item)}
              </span>
            </div>

            {/* Order No */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img27.png" className="w-4 h-4 opacity-60" />
                <span>{t("order.labels.code")}: <span className="text-gray-900 font-mono">{item.order_sn}</span></span>
              </div>
              <button onClick={() => handleCopy(item.order_sn)} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition">
                {t("common.copy")}
              </button>
            </div>

            {/* Details */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-xs text-gray-600 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">{t("order.labels.country")}:</span>
                <span className="font-medium text-gray-800">{item.country?.title || t("order.labels.not_provided")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t("order.labels.items")}:</span>
                <span className="font-medium text-gray-800 max-w-[60%] truncate">{item.class_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t("order.labels.time")}:</span>
                <span className="font-medium text-gray-800">{item.created_time}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              {item.status != -1 && item.status != 3 && (
                <Button
                  variant="danger"
                  outline
                  className="!py-1.5 !px-3 !text-xs !h-auto"
                  onClick={() => handleCancelClick(item.id)}
                >
                  {t("order.buttons.cancel")}
                </Button>
              )}

              {item.status == 2 && (
                <Button
                  variant="primary"
                  className="!py-1.5 !px-3 !text-xs !h-auto"
                  onClick={() => handlePay(item.id)}
                >
                  {t("order.buttons.pay")}
                </Button>
              )}

              {item.status != -1 && item.status != 3 && (
                <Button
                  variant="outline"
                  className="!py-1.5 !px-3 !text-xs !h-auto"
                  onClick={() => handleDetail(item.id)}
                >
                  {t("order.buttons.detail")}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t("common.confirm")}</h3>
            <p className="text-gray-600 mb-6 font-medium">
              {t("order.cancel_confirm")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={confirmCancel}
                className="w-full py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition shadow-lg shadow-red-200"
              >
                {t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      <Loading is={loading} text={loadingText} />
    </div>
  );
};

export default OrderListPage;