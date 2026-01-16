import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import OptimizedImage from '../Common/OptimizedImage';

/**
 * Shipping Route Card Component
 * 
 * Visual route information display with transport icons
 */
const ShippingRouteCard = ({ line, image, onDetail }) => {
  const { t } = useTranslation();

  if (!line) {
    return null;
  }

  // Determine transport icon based on route name
  const getTransportIcon = () => {
    const name = (line.name || '').toLowerCase();
    if (name.includes('air') || name.includes('plane') || name.includes('ทางอากาศ')) {
      return '✈️';
    }
    if (name.includes('sea') || name.includes('ship') || name.includes('ทางเรือ')) {
      return '🚢';
    }
    if (name.includes('express') || name.includes('ด่วน')) {
      return '⚡';
    }
    return '🚚';
  };

  const transportIcon = getTransportIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-orange-50 to-yellow-50">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">🛣️</span>
          {t("order.labels.route_info", "ข้อมูลเส้นทาง")}
        </h3>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex gap-4 items-start">
          {/* Route Image */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="flex-shrink-0"
          >
            <OptimizedImage 
              src={image || "https://zhuanyun.sllowly.cn/attachment/no_pic.png"} 
              className="w-20 h-20 rounded-2xl object-cover bg-gray-100 shadow-md"
              alt="Route"
            />
          </motion.div>

          {/* Route Details */}
          <div className="flex-1 space-y-3">
            {/* Route Name */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-orange-400 to-red-500 p-2 rounded-xl text-white shadow-md">
                <span className="text-2xl">{transportIcon}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-base">
                  {line.name}
                </p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="space-y-2">
              {/* Delivery Time */}
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-blue-50 p-1.5 rounded-lg">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-500">
                  {t("order.labels.delivery_time", "เวลาจัดส่ง")}:
                </span>
                <span className="font-medium text-gray-900">
                  {line.limitationofdelivery || t("order.labels.not_provided", "ไม่ระบุ")}
                </span>
              </div>

              {/* Tariff */}
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-green-50 p-1.5 rounded-lg">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-500">
                  {t("order.labels.tariff", "อัตราค่าส่ง")}:
                </span>
                <span className="font-bold text-green-600">
                  {line.tariff || t("order.labels.not_provided", "ไม่ระบุ")}
                </span>
              </div>
            </div>

            {/* Detail Button */}
            {onDetail && (
              <button
                onClick={() => onDetail(line.id)}
                className="w-full mt-2 py-2 px-4 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{t("order.buttons.view_details", "ดูรายละเอียด")}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShippingRouteCard;
