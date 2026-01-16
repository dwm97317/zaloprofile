import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { orderIdState, lineIdState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import Loading from "../../components/Loading/Index";
import OrderDetailHero from "../../components/OrderDetail/OrderDetailHero";
import OrderJourneyTimeline from "../../components/OrderDetail/OrderJourneyTimeline";
import EnhancedAddressCard from "../../components/OrderDetail/EnhancedAddressCard";
import PackageItemCard from "../../components/OrderDetail/PackageItemCard";
import ShippingRouteCard from "../../components/OrderDetail/ShippingRouteCard";
import DimensionsInfoCard from "../../components/OrderDetail/DimensionsInfoCard";
import CostBreakdownCard from "../../components/OrderDetail/CostBreakdownCard";
import OrderActionBar from "../../components/OrderDetail/OrderActionBar";

const OrderDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const orderId = useRecoilValue(orderIdState);
  const setLineId = useSetRecoilState(lineIdState);

  const [detail, setDetail] = useState(null);
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
      const res = await request.post("package/details_pack", {
        id: orderId,
        method: ["edit"]
      });
      if (res.data) {
        setDetail(res.data);
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
      const res = await request.post("package/canclePack", { id: orderId });
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

  if (!detail) return <Loading is={true} />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-20 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">{t("order.detail_title", "รายละเอียดคำสั่งซื้อ")}</h1>
      </div>

      {/* Hero Section */}
      <OrderDetailHero 
        status={detail.status}
        isPay={detail.is_pay}
        orderSn={detail.order_sn}
      />

      {/* Content Container */}
      <div className="px-4 space-y-4 mt-4">
        {/* Journey Timeline */}
        <OrderJourneyTimeline 
          status={detail.status}
          isPay={detail.is_pay}
        />

        {/* Address Card */}
        <EnhancedAddressCard address={detail.address} />

        {/* Package Items */}
        {detail.item && detail.item.map((item, idx) => (
          <PackageItemCard 
            key={idx}
            item={item}
            index={idx}
          />
        ))}

        {/* Shipping Route */}
        {detail.line && (
          <ShippingRouteCard 
            line={detail.line}
            image={detail.image}
            onDetail={handleLineDetail}
          />
        )}

        {/* Dimensions Info */}
        <DimensionsInfoCard 
          weight={detail.weight}
          volume={detail.volume}
          caleWeight={detail.cale_weight}
        />

        {/* Cost Breakdown */}
        <CostBreakdownCard 
          baseFee={detail.free}
          packFee={detail.pack_free}
          otherFee={detail.other_free}
          isPay={detail.is_pay}
        />
      </div>

      {/* Action Bar */}
      <OrderActionBar 
        status={detail.status}
        isPay={detail.is_pay}
        loading={loading}
        onCancel={() => setShowCancelModal(true)}
        onPay={() => {
          // TODO: Implement payment flow
          console.log("Pay clicked");
        }}
        onTrack={() => {
          // TODO: Implement tracking flow
          console.log("Track clicked");
        }}
      />

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowCancelModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t("common.confirm", "ยืนยัน")}
              </h3>
              <p className="text-gray-600 font-medium">
                {t("order.cancel_confirm", "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition active:scale-95"
              >
                {t("common.cancel", "ยกเลิก")}
              </button>
              <button
                onClick={confirmCancel}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 transition shadow-lg shadow-red-200 active:scale-95"
              >
                {t("common.confirm", "ยืนยัน")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Loading is={loading} />
    </div>
  );
};

export default OrderDetailPage;