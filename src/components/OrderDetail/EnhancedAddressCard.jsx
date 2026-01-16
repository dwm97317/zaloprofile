import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Enhanced Address Card Component
 * 
 * Beautiful address display with map icon and proper formatting
 */
const EnhancedAddressCard = ({ address }) => {
  const { t } = useTranslation();

  const safeVal = (val) => (val === null || val === undefined || val === "" ? "" : val);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-green-50 to-blue-50">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">📍</span>
          {t("order.labels.delivery_address", "ที่อยู่จัดส่ง")}
        </h3>
      </div>

      {/* Content */}
      <div className="p-4">
        {address ? (
          <div className="flex items-start gap-4">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="bg-gradient-to-br from-green-400 to-blue-500 p-3 rounded-2xl text-white shadow-lg flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.div>

            {/* Address Details */}
            <div className="flex-1 space-y-2">
              {/* Name and Phone */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-gray-900 text-base">
                    {safeVal(address.name) || t("order.labels.not_provided", "ไม่ระบุ")}
                  </p>
                  <p className="text-gray-600 text-sm flex items-center gap-1.5 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {safeVal(address.phone) || t("order.labels.not_provided", "ไม่ระบุ")}
                  </p>
                </div>
              </div>

              {/* Full Address */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {[
                    safeVal(address.detail),
                    safeVal(address.region),
                    safeVal(address.city),
                    safeVal(address.province)
                  ].filter(Boolean).join(', ') || t("order.labels.not_provided", "ไม่ระบุ")}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-5xl mb-3 opacity-30">📍</div>
              <p className="text-gray-400 font-medium">
                {t("order.labels.no_address", "ไม่มีที่อยู่จัดส่ง")}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedAddressCard;
