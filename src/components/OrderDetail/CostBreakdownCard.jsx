import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Cost Breakdown Card Component
 * 
 * Detailed cost breakdown with visual hierarchy
 */
const CostBreakdownCard = ({ baseFee, packFee, otherFee, isPay }) => {
  const { t } = useTranslation();

  const safeVal = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const base = safeVal(baseFee);
  const pack = safeVal(packFee);
  const other = safeVal(otherFee);
  const total = base + pack + other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-green-50 to-emerald-50">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">💰</span>
          {t("order.labels.cost_info", "ค่าใช้จ่าย")}
        </h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Total - Large Display */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
          className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-5 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm mb-1">
                {t("order.labels.total_cost", "รวมทั้งหมด")}
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-4xl font-bold"
              >
                ฿{total.toFixed(2)}
              </motion.p>
            </div>
            <div className="text-6xl opacity-20">
              💰
            </div>
          </div>
        </motion.div>

        {/* Cost Breakdown */}
        <div className="space-y-2">
          <CostRow
            icon="🚚"
            label={t("order.labels.base_fee", "ค่าจัดส่ง")}
            value={base}
            delay={0.9}
          />
          <CostRow
            icon="📦"
            label={t("order.labels.pack_fee", "ค่าแพ็ค")}
            value={pack}
            delay={1.0}
          />
          <CostRow
            icon="➕"
            label={t("order.labels.other_fee", "ค่าบริการอื่นๆ")}
            value={other}
            delay={1.1}
          />
        </div>

        {/* Payment Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className={`
            rounded-xl p-4 border-2 flex items-center justify-between
            ${isPay === 1 
              ? 'bg-green-50 border-green-200' 
              : 'bg-orange-50 border-orange-200'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className={`
              p-2 rounded-xl text-white shadow-md
              ${isPay === 1 
                ? 'bg-gradient-to-br from-green-400 to-green-600' 
                : 'bg-gradient-to-br from-orange-400 to-orange-600'
              }
            `}>
              <span className="text-2xl">
                {isPay === 1 ? '✅' : '💳'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">
                {t("order.labels.payment_status", "สถานะการชำระเงิน")}
              </p>
              <p className={`
                font-bold text-base
                ${isPay === 1 ? 'text-green-700' : 'text-orange-700'}
              `}>
                {isPay === 1 
                  ? t("order.labels.paid", "ชำระแล้ว")
                  : t("order.labels.unpaid", "รอชำระเงิน")
                }
              </p>
            </div>
          </div>
          {isPay === 1 && (
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              {t("order.labels.completed", "เสร็จสิ้น")}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Cost Row Component
const CostRow = ({ icon, label, value, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="bg-gray-50 rounded-xl p-3 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-sm text-gray-600">{label}</span>
        </div>
        <span className="font-bold text-base text-gray-900">
          ฿{value.toFixed(2)}
        </span>
      </div>
    </motion.div>
  );
};

export default CostBreakdownCard;
