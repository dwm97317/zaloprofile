import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from '../../utils/toast';

/**
 * Package Item Card Component
 * 
 * Individual package item display with tracking, carrier, and dimensions
 */
const PackageItemCard = ({ item, index }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const safeVal = (val) => (val === null || val === undefined || val === "" ? "0" : val);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(t("common.copy_success", "คัดลอกแล้ว"));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">📦</span>
          {t("order.labels.package", "พัสดุ")} #{index + 1}
        </h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Tracking Number */}
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="bg-blue-500 p-1.5 rounded-lg flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">
                  {t("order.labels.tracking_no", "หมายเลขติดตาม")}
                </p>
                <p className="font-mono font-bold text-sm text-gray-900 truncate">
                  {item.express_num || t("order.labels.not_provided", "ไม่ระบุ")}
                </p>
              </div>
            </div>
            {item.express_num && (
              <button
                onClick={() => handleCopy(item.express_num)}
                className="ml-2 p-2 rounded-lg hover:bg-blue-100 transition-colors active:scale-95 flex-shrink-0"
              >
                {copied ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Carrier and Category */}
        <div className="grid grid-cols-2 gap-3">
          <InfoChip
            icon="🚚"
            label={t("order.labels.carrier", "ขนส่ง")}
            value={item.express_name || t("order.labels.not_provided", "ไม่ระบุ")}
            color="orange"
          />
          <InfoChip
            icon="📦"
            label={t("order.labels.items", "สินค้า")}
            value={item.class_name || t("order.labels.not_provided", "ไม่ระบุ")}
            color="purple"
          />
        </div>

        {/* Dimensions */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚖️</span>
              <div>
                <p className="text-xs text-gray-500">
                  {t("order.labels.weight", "น้ำหนัก")}
                </p>
                <p className="font-bold text-sm text-gray-900">
                  {safeVal(item.weight)} kg
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📏</span>
              <div>
                <p className="text-xs text-gray-500">
                  {t("order.labels.dimensions", "ขนาด")}
                </p>
                <p className="font-bold text-sm text-gray-900">
                  {safeVal(item.length)}×{safeVal(item.width)}×{safeVal(item.height)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warehouse Time */}
        {item.entering_warehouse_time && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">📅</span>
            <span className="text-gray-500">
              {t("order.labels.warehouse_time", "เวลาเข้าคลัง")}:
            </span>
            <span className="font-medium text-gray-900">
              {item.entering_warehouse_time}
            </span>
          </div>
        )}

        {/* Remark */}
        {item.remark && (
          <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
            <div className="flex items-start gap-2">
              <span className="text-lg flex-shrink-0">📝</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">
                  {t("order.labels.remark", "หมายเหตุ")}
                </p>
                <p className={`text-sm text-gray-700 ${!expanded && 'line-clamp-2'}`}>
                  {item.remark}
                </p>
                {item.remark.length > 100 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
                  >
                    {expanded ? t("common.show_less", "แสดงน้อยลง") : t("common.show_more", "แสดงเพิ่มเติม")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Info Chip Component
const InfoChip = ({ icon, label, value, color }) => {
  const colorClasses = {
    orange: 'bg-orange-50 border-orange-100',
    purple: 'bg-purple-50 border-purple-100',
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-green-50 border-green-100'
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl p-3 border`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-0.5">{label}</p>
          <p className="font-bold text-sm text-gray-900 truncate">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default PackageItemCard;
