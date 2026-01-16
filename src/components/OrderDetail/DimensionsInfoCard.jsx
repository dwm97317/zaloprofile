import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Dimensions Info Card Component
 * 
 * Visual dimensions and weight display with icons
 */
const DimensionsInfoCard = ({ weight, volume, caleWeight }) => {
  const { t } = useTranslation();

  const safeVal = (val) => (val === null || val === undefined || val === "" ? "0" : val);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">📦</span>
          {t("order.labels.packing_info", "ข้อมูลการแพ็ค")}
        </h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Actual Weight */}
        <DimensionRow
          icon="⚖️"
          label={t("order.labels.weight", "น้ำหนักจริง")}
          value={`${safeVal(weight)} kg`}
          color="blue"
          delay={0.6}
        />

        {/* Volume Weight */}
        <DimensionRow
          icon="📦"
          label={t("order.labels.vol_weight", "น้ำหนักปริมาตร")}
          value={`${safeVal(volume)} kg`}
          color="purple"
          delay={0.7}
        />

        {/* Chargeable Weight - Highlighted */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-3 rounded-xl text-white shadow-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">
                  {t("order.labels.charge_weight", "น้ำหนักคิดค่าส่ง")}
                </p>
                <p className="font-bold text-xl text-gray-900">
                  {safeVal(caleWeight)} kg
                </p>
              </div>
            </div>
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              {t("order.labels.billable", "คิดค่าส่ง")}
            </div>
          </div>
        </motion.div>

        {/* Info Note */}
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t("order.labels.weight_note", "ค่าจัดส่งคำนวณจากน้ำหนักที่มากกว่าระหว่างน้ำหนักจริงและน้ำหนักปริมาตร")}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Dimension Row Component
const DimensionRow = ({ icon, label, value, color, delay }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100',
    purple: 'bg-purple-50 border-purple-100',
    green: 'bg-green-50 border-green-100',
    orange: 'bg-orange-50 border-orange-100'
  };

  const iconColorClasses = {
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    green: 'from-green-400 to-green-600',
    orange: 'from-orange-400 to-orange-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`${colorClasses[color]} rounded-xl p-3 border`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`bg-gradient-to-br ${iconColorClasses[color]} p-2 rounded-lg text-white shadow-md`}>
            <span className="text-xl">{icon}</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="font-bold text-base text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DimensionsInfoCard;
