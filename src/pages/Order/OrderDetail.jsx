import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { orderIdState, lineIdState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import Button from "../../components/Button/Index";
import Loading from "../../components/Loading/Index";

const OrderDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const orderId = useRecoilValue(orderIdState);
  const setLineId = useSetRecoilState(lineIdState);

  const [detail, setDetail] = useState(null);
  const [statusInfo, setStatusInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!orderId) {
      navigate(-1);
      return;
    }
    util.setBarPageView("Order Detail");
    fetchDetail();
  }, [orderId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await request.post("package/details_pack&wxapp_id=10001", {
        id: orderId,
        method: "edit",
      });
      if (res.data) {
        setDetail(res.data);
        setStatusInfo(getStatusMap(res.data.status));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = async () => {
    setShowCancelModal(false);
    setLoading(true);
    try {
      const res = await request.post("package/canclePack&wxapp_id=10001", { id: orderId });
      if (res.code === 1) {
        alert(t("order.cancel_success"));
        navigate(-1);
      } else {
        alert(res.msg || t("common.error"));
      }
    } catch (e) {
      alert(t("common.error_network"));
    } finally {
      setLoading(false);
    }
  };

  const handleLineDetail = (lineId) => {
    if (lineId) {
      setLineId(lineId);
      // navigate("/common/line/detail"); // Assuming this route exists or will exist
    }
  };

  const getStatusMap = (statusId) => {
    // Simplified mapping, ideally this could significantly expanded or fetched
    const map = {
      1: { name: t("order.status.pending_check"), desc: "Your package is waiting for inspection", color: "text-yellow-600", bg: "bg-yellow-50" },
      2: { name: t("order.status.pending_pay"), desc: "Waiting for payment", color: "text-orange-600", bg: "bg-orange-50" },
      3: { name: t("order.status.paid"), desc: "Payment received", color: "text-green-600", bg: "bg-green-50" },
      // ... Add more mappings based on original file logic if needed, but simplified for clarity
      6: { name: t("order.status.shipped"), desc: "Package has been shipped", color: "text-blue-600", bg: "bg-blue-50" },
      8: { name: t("order.status.completed"), desc: "Order completed", color: "text-green-700", bg: "bg-green-100" },
      "-1": { name: t("order.status.cancelled"), desc: "Order cancelled", color: "text-gray-500", bg: "bg-gray-100" }
    };
    return map[statusId] || { name: "Unknown", desc: "", color: "text-gray-600", bg: "bg-gray-50" };
  };

  const safeVal = (val) => (val === null || val === undefined || val === "" ? "0" : val);

  if (!detail) return <Loading is={true} />;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-20 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">{t("order.detail_title")}</h1>
      </div>

      {/* Status Card */}
      <div className={`mx-4 mt-4 p-5 rounded-2xl ${statusInfo.bg} shadow-sm border border-opacity-50 border-gray-100`}>
        <h2 className={`text-xl font-bold ${statusInfo.color}`}>{statusInfo.name}</h2>
        <p className="text-gray-500 text-sm mt-1">{statusInfo.desc}</p>
      </div>

      {/* Address */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
        <div className="bg-blue-50 p-2 rounded-full text-blue-500 mt-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="flex-1">
          {detail.address ? (
            <>
              <p className="font-bold text-gray-800">
                {safeVal(detail.address.name)} <span className="text-gray-500 font-normal ml-2">{safeVal(detail.address.phone)}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {`${detail.address.province} ${detail.address.city} ${detail.address.region} ${detail.address.detail}`}
              </p>
            </>
          ) : (
            <p className="text-gray-400 italic font-medium">{t("order.labels.not_provided")}</p>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between py-1 border-b border-gray-50">
          <span className="text-gray-500 text-sm">{t("order.labels.code")}</span>
          <span className="font-mono font-medium text-gray-800">{detail.order_sn}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-500 text-sm">Status</span>
          <span className={`font-bold text-sm ${statusInfo.color}`}>{statusInfo.name}</span>
        </div>
      </div>

      {/* Items */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3 text-lg border-b border-gray-100 pb-2">{t("order.labels.package_info")}</h3>
        {detail.item && detail.item.map((item, idx) => (
          <div key={idx} className="mb-6 last:mb-0 space-y-2 border-b border-dashed border-gray-100 last:border-0 pb-4 last:pb-0">
            <InfoRow label={t("order.labels.tracking_no")} value={item.express_num} />
            <InfoRow label={t("order.labels.carrier")} value={item.express_name} />
            <InfoRow label={t("order.labels.items")} value={item.class_name} />
            <InfoRow label={t("order.labels.dims")} value={`${safeVal(item.length)}/${safeVal(item.width)}/${safeVal(item.height)}/${safeVal(item.weight)}`} />
            <InfoRow label={t("order.labels.warehouse_time")} value={item.entering_warehouse_time} />
            <InfoRow label={t("order.labels.remark")} value={item.remark} />
          </div>
        ))}
      </div>

      {/* Route Info */}
      {detail.line && (
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm" onClick={() => handleLineDetail(detail.line.id)}>
          <h3 className="font-bold text-gray-800 mb-3 text-lg border-b border-gray-100 pb-2">{t("order.labels.route_info")}</h3>
          <div className="flex gap-4 items-start">
            <img src={detail.image || "https://zhuanyun.sllowly.cn/attachment/no_pic.png"} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
            <div className="flex-1 space-y-1">
              <p className="font-bold text-gray-900">{detail.line.name}</p>
              <p className="text-xs text-gray-500">{t("order.labels.delivery_time")}: {detail.line.limitationofdelivery}</p>
              <p className="text-xs text-gray-500">{t("order.labels.tariff")}: <span className="text-blue-600 font-medium">{detail.line.tariff}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Dimensions Info */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3 text-lg border-b border-gray-100 pb-2">{t("order.labels.packing_info")}</h3>
        <div className="space-y-2">
          <InfoRow label={t("order.labels.weight")} value={safeVal(detail.weight)} />
          <InfoRow label={t("order.labels.vol_weight")} value={safeVal(detail.volume)} />
          <InfoRow label={t("order.labels.charge_weight")} value={safeVal(detail.cale_weight)} />
        </div>
      </div>

      {/* Cost Info */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3 text-lg border-b border-gray-100 pb-2">{t("order.labels.cost_info")}</h3>
        <div className="space-y-2">
          <InfoRow label={t("order.labels.base_fee")} value={safeVal(detail.free)} highlight />
          <InfoRow label={t("order.labels.pack_fee")} value={safeVal(detail.pack_free)} />
          <InfoRow label={t("order.labels.other_fee")} value={safeVal(detail.other_free)} />
        </div>
      </div>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] border-t border-gray-100">
        <Button onClick={() => setShowCancelModal(true)} disabled={loading} variant="danger" className="w-full h-12 text-lg rounded-xl">
          {t("order.buttons.cancel")}
        </Button>
      </div>

      {/* Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
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

      <Loading is={loading} />
    </div>
  );
};

const InfoRow = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-500">{label}</span>
    <span className={`font-medium ${highlight ? "text-blue-600 font-bold" : "text-gray-800"} text-right max-w-[60%]`}>{value}</span>
  </div>
);

export default OrderDetailPage;