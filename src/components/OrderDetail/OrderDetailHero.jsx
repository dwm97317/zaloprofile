import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from '../../utils/toast';

/**
 * Order Detail Hero Component
 * 
 * Status-driven hero section with gradient background and order number
 */
const OrderDetailHero = ({ status, isPay, orderSn }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const getStatusConfig = () => {
    if (status === -1) {
      return {
        gradient: 'from-red-400 to-red-600',
        icon: '❌',
        title: t("order.status.cancelled", "ยกเลิก"),
        description: t("order.status.cancelled_desc", "คำสั่งซื้อถูกยกเลิกแล้ว")
      };
    }
    
    if (status === 1) {
      return {
        gradient: 'from-gray-400 to-gray-600',
        icon: '⏱️',
        title: t("order.status.pending_check", "รอตรวจสอบ"),
        description: t("order.status.pending_check_desc", "กำลังตรวจสอบพัสดุของคุณ")
      };
    }
    
    if (status === 2 && isPay === 2) {
      return {
        gradient: 'from-orange-400 to-orange-600',
        icon: '💳',
        title: t("order.status.pending_pay", "รอชำระเงิน"),
        description: t("order.status.pending_pay_desc", "กรุณาชำระเงินเพื่อดำเนินการต่อ")
      };
    }
    
    if (status === 3 && isPay === 1) {
      return {
        gradient: 'from-blue-400 to-blue-600',
        icon: '✅',
        title: t("order.status.paid", "ชำระแล้ว"),
        description: t("order.status.paid_desc", "ได้รับการชำระเงินแล้ว")
      };
    }
    
    if ((status === 4 || status === 5) && isPay === 1) {
      return {
        gradient: 'from-purple-400 to-purple-600',
        icon: '📦',
        title: t("order.status.packing", "กำลังแพ็ค"),
        description: t("order.status.packing_desc", "กำลังแพ็คพัสดุของคุณ")
      };
    }
    
    if (status === 6 && isPay === 1) {
      return {
        gradient: 'from-green-400 to-green-600',
        icon: '🚚',
        title: t("order.status.shipped", "จัดส่งแล้ว"),
        description: t("order.status.shipped_desc", "พัสดุออกจัดส่งแล้ว")
      };
    }
    
    if (status >= 7 && isPay === 1) {
      return {
        gradient: 'from-green-500 to-green-700',
        icon: '✅',
        title: t("order.status.completed", "เสร็จสิ้น"),
        description: t("order.status.completed_desc", "ได้รับพัสดุเรียบร้อยแล้ว")
      };
    }
    
    return {
      gradient: 'from-gray-400 to-gray-600',
      icon: '📋',
      title: t("order.status.unknown", "ไม่ทราบสถานะ"),
      description: t("order.status.unknown_desc", "กรุณาติดต่อฝ่ายสนับสนุน")
    };
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderSn);
      setCopied(true);
      toast.success(t("common.copy_success", "คัดลอกแล้ว"));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = orderSn;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        toast.success(t("common.copy_success", "คัดลอกแล้ว"));
        setTimeout(() => setCopied(false), 2000);
      } catch (err2) {
        toast.error(t("common.copy_failed", "คัดลอกล้มเหลว"));
      }
      document.body.removeChild(textArea);
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${config.gradient} px-6 py-8 text-white relative overflow-hidden`}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 text-6xl animate-pulse">📦</div>
        <div className="absolute bottom-4 left-4 text-4xl animate-bounce">🚚</div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Status Icon and Title */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex flex-col items-center mb-6"
        >
          <div className="text-7xl mb-3 filter drop-shadow-lg">
            {config.icon}
          </div>
          <h2 className="text-2xl font-bold mb-1">
            {config.title}
          </h2>
          <p className="text-white/90 text-sm text-center">
            {config.description}
          </p>
        </motion.div>

        {/* Order Number */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/30 p-2 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white/80 text-xs mb-0.5">
                {t("order.labels.order_number", "หมายเลขคำสั่งซื้อ")}
              </p>
              <p className="font-mono font-bold text-lg">
                {orderSn}
              </p>
            </div>
          </div>

          {/* Copy Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            className="bg-white/30 hover:bg-white/40 p-3 rounded-xl transition-colors active:scale-95"
          >
            {copied ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OrderDetailHero;
