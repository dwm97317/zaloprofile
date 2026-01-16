import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from '../../utils/toast';
import OrderProgressBar from './OrderProgressBar';

/**
 * Enhanced Order List Card Component
 * 
 * Status-colored card with progress bar and prominent order number
 */
const EnhancedOrderListCard = forwardRef(({
  item,
  onDetail,
  onCancel,
  onPay,
  onConfirmReceive
}, ref) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const getStatusConfig = () => {
    const { status, is_pay } = item;
    
    // -1: 已取消/问题件
    if (status === -1) {
      return {
        gradient: 'from-red-400 to-red-600',
        border: 'border-red-200',
        icon: '❌'
      };
    }
    
    // 1: 待查验
    if (status === 1) {
      return {
        gradient: 'from-gray-400 to-gray-600',
        border: 'border-gray-200',
        icon: '⏱️'
      };
    }
    
    // 2: 待支付 或 已支付但状态还是2
    if (status === 2) {
      if (is_pay === 2) {
        return {
          gradient: 'from-orange-400 to-orange-600',
          border: 'border-orange-200',
          icon: '💳'
        };
      } else {
        return {
          gradient: 'from-blue-400 to-blue-600',
          border: 'border-blue-200',
          icon: '✅'
        };
      }
    }
    
    // 3: 待发货 (已支付)
    if (status === 3) {
      return {
        gradient: 'from-blue-400 to-blue-600',
        border: 'border-blue-200',
        icon: '📦'
      };
    }
    
    // 4: 已拣货
    if (status === 4) {
      return {
        gradient: 'from-indigo-400 to-indigo-600',
        border: 'border-indigo-200',
        icon: '🔍'
      };
    }
    
    // 5: 已打包
    if (status === 5) {
      return {
        gradient: 'from-purple-400 to-purple-600',
        border: 'border-purple-200',
        icon: '📦'
      };
    }
    
    // 6: 已发货
    if (status === 6) {
      return {
        gradient: 'from-teal-400 to-teal-600',
        border: 'border-teal-200',
        icon: '🚚'
      };
    }
    
    // 7: 已收货
    if (status === 7) {
      return {
        gradient: 'from-green-400 to-green-600',
        border: 'border-green-200',
        icon: '📬'
      };
    }
    
    // 8: 已完成
    if (status === 8) {
      return {
        gradient: 'from-emerald-400 to-emerald-600',
        border: 'border-emerald-200',
        icon: '✅'
      };
    }
    
    // 默认
    return {
      gradient: 'from-gray-400 to-gray-600',
      border: 'border-gray-200',
      icon: '📋'
    };
  };

  const getStatusText = () => {
    const { status, is_pay } = item;
    if (status === -1) return 'ยกเลิก'; // 已取消
    if (status === 1) return 'รอตรวจสอบ'; // 待查验
    if (status === 2 && is_pay === 2) return 'รอชำระเงิน'; // 待支付
    if (status === 2 && is_pay === 1) return 'ชำระแล้ว'; // 已支付但状态还是2
    if (status === 3) return 'รอจัดส่ง'; // 待发货 (已支付，等待发货)
    if (status === 4) return 'กำลังคัดแยก'; // 拣货中
    if (status === 5) return 'แพ็คเสร็จแล้ว'; // 已打包
    if (status === 6) return 'จัดส่งแล้ว'; // 已发货
    if (status === 7) return 'ได้รับแล้ว'; // 已收货
    if (status === 8) return 'เสร็จสิ้น'; // 已完成
    return 'ไม่ทราบสถานะ'; // 未知状态
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.order_sn);
      setCopied(true);
      toast.success(t("common.copy_success", "คัดลอกแล้ว"));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = item.order_sn;
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
  // 已发货(6)、已收货(7)、已完成(8)状态不能取消
  const canCancel = item.status !== -1 && item.status < 6;
  const canPay = item.status === 2 && item.is_pay === 2;
  // 已发货状态显示"确认收货"按钮
  const canConfirmReceive = item.status === 6;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 ${config.border}`}
    >
      {/* Status Header with Progress */}
      <div className={`bg-gradient-to-r ${config.gradient} px-4 py-3`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <span className="font-bold text-white text-sm">{getStatusText()}</span>
          </div>
          <span className="text-white/90 text-xs font-medium">
            {item.storage?.shop_name || 'คลัง'}
          </span>
        </div>
        <OrderProgressBar status={item.status} isPay={item.is_pay} />
      </div>

      {/* Order Number - Prominent */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">📋</span>
            <span className="font-mono font-bold text-gray-900 text-sm">
              {item.order_sn}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="group relative p-2 rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
          >
            {copied ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Shipping Info - Highlighted for shipped orders */}
      {item.status === 6 && item.t_order_sn && (
        <div className="mx-4 mt-3 space-y-2">
          {/* Original Shipping Info */}
          <div className="p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border-2 border-teal-200">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-xl">🚚</span>
              <div className="flex-1">
                <div className="text-xs text-teal-600 font-medium mb-1">
                  {t("order.labels.carrier", "ขนส่ง")}
                </div>
                <div className="font-bold text-gray-900 text-sm">
                  {item.t_name || t("order.labels.not_provided", "ไม่ระบุ")}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">📮</span>
              <div className="flex-1">
                <div className="text-xs text-teal-600 font-medium mb-1">
                  {t("order.labels.tracking_number", "หมายเลขติดตาม")}
                </div>
                <div className="font-mono font-bold text-gray-900 text-sm break-all">
                  {item.t_order_sn}
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(item.t_order_sn);
                    toast.success(t("common.copy_success", "คัดลอกแล้ว"));
                  } catch (err) {
                    const textArea = document.createElement("textarea");
                    textArea.value = item.t_order_sn;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-999999px";
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                      document.execCommand("copy");
                      toast.success(t("common.copy_success", "คัดลอกแล้ว"));
                    } catch (err2) {
                      toast.error(t("common.copy_failed", "คัดลอกล้มเหลว"));
                    }
                    document.body.removeChild(textArea);
                  }
                }}
                className="p-2 rounded-lg hover:bg-teal-100 transition-colors active:scale-95 flex-shrink-0"
              >
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Transfer Shipping Info - Highlighted in Red/Orange */}
          {item.t2_order_sn && (
            <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-300 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🔄</span>
                <div className="text-xs font-bold text-orange-700 uppercase tracking-wide">
                  {t("order.labels.transfer_info", "ข้อมูลการโอนย้าย")}
                </div>
              </div>
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xl">🚚</span>
                <div className="flex-1">
                  <div className="text-xs text-orange-600 font-medium mb-1">
                    {t("order.labels.transfer_carrier", "ขนส่งใหม่")}
                  </div>
                  <div className="font-bold text-red-700 text-sm">
                    {item.t2_name || t("order.labels.not_provided", "ไม่ระบุ")}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xl">📮</span>
                <div className="flex-1">
                  <div className="text-xs text-orange-600 font-medium mb-1">
                    {t("order.labels.transfer_tracking", "หมายเลขติดตามใหม่")}
                  </div>
                  <div className="font-mono font-bold text-red-700 text-sm break-all">
                    {item.t2_order_sn}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(item.t2_order_sn);
                      toast.success(t("common.copy_success", "คัดลอกแล้ว"));
                    } catch (err) {
                      const textArea = document.createElement("textarea");
                      textArea.value = item.t2_order_sn;
                      textArea.style.position = "fixed";
                      textArea.style.left = "-999999px";
                      document.body.appendChild(textArea);
                      textArea.select();
                      try {
                        document.execCommand("copy");
                        toast.success(t("common.copy_success", "คัดลอกแล้ว"));
                      } catch (err2) {
                        toast.error(t("common.copy_failed", "คัดลอกล้มเหลว"));
                      }
                      document.body.removeChild(textArea);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-orange-100 transition-colors active:scale-95 flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details */}
      <div className="px-4 py-3 space-y-2 text-sm">
        <InfoRow 
          icon="🌍" 
          label={t("order.labels.country", "ประเทศ")}
          value={item.country?.title || t("order.labels.not_provided", "ไม่ระบุ")}
        />
        <InfoRow 
          icon="📦" 
          label={t("order.labels.items", "สินค้า")}
          value={item.class_name || '-'}
        />
        <InfoRow 
          icon="📅" 
          label={t("order.labels.time", "เวลา")}
          value={item.created_time || '-'}
        />
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
        {canPay && (
          <ActionButton
            variant="primary"
            icon="💳"
            onClick={() => onPay(item.id)}
          >
            {t("order.buttons.pay", "ชำระเงิน")}
          </ActionButton>
        )}
        
        {canConfirmReceive && (
          <ActionButton
            variant="success"
            icon="📬"
            onClick={() => onConfirmReceive(item.id)}
          >
            {t("order.buttons.confirm_receive", "ได้รับแล้ว")}
          </ActionButton>
        )}
        
        {canCancel && (
          <ActionButton
            variant="danger"
            icon="❌"
            outline
            onClick={() => onCancel(item.id)}
          >
            {t("order.buttons.cancel", "ยกเลิก")}
          </ActionButton>
        )}
        
        <ActionButton
          variant="secondary"
          icon="👁️"
          onClick={() => onDetail(item.id)}
        >
          {t("order.buttons.detail", "รายละเอียด")}
        </ActionButton>
      </div>
    </motion.div>
  );
});

EnhancedOrderListCard.displayName = 'EnhancedOrderListCard';

// Info Row Component
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-500 flex items-center gap-1.5">
      <span>{icon}</span>
      <span>{label}:</span>
    </span>
    <span className="font-medium text-gray-900 text-right max-w-[60%] truncate">
      {value}
    </span>
  </div>
);

// Action Button Component
const ActionButton = ({ variant = 'secondary', icon, outline, onClick, children }) => {
  const variants = {
    primary: outline 
      ? 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50'
      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl',
    success: outline
      ? 'border-2 border-green-500 text-green-600 hover:bg-green-50'
      : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl',
    danger: outline
      ? 'border-2 border-red-500 text-red-600 hover:bg-red-50'
      : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl',
    secondary: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-1.5
        py-2.5 rounded-xl text-xs font-bold
        transition-all active:scale-95
        ${variants[variant]}
      `}
    >
      <span>{icon}</span>
      <span>{children}</span>
    </button>
  );
};

export default EnhancedOrderListCard;
