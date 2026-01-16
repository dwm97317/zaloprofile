import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Cost Summary Bar Component
 * 
 * Sticky bottom bar with cost breakdown and CTA
 */
const CostSummaryBar = ({ 
  visible = true,
  shippingCost = 0,
  serviceCost = 0,
  totalCost = 0,
  onSubmit,
  disabled = false,
  loading = false
}) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-20"
        >
          <div className="max-w-lg mx-auto px-4 py-4">
            {/* Cost Breakdown */}
            <div className="space-y-2 mb-3">
              <CostRow 
                label={t("package.cost.shipping", "ค่าจัดส่ง")}
                value={shippingCost}
                icon="🚚"
              />
              {serviceCost > 0 && (
                <CostRow 
                  label={t("package.cost.services", "บริการแพ็ค")}
                  value={serviceCost}
                  icon="🎁"
                />
              )}
              <div className="border-t border-gray-200 pt-2">
                <CostRow 
                  label={t("package.cost.total", "รวมทั้งหมด")}
                  value={totalCost}
                  icon="💰"
                  bold
                />
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              onClick={onSubmit}
              disabled={disabled || loading}
              className={`
                w-full py-4 rounded-2xl font-bold shadow-lg transition-all
                ${disabled || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-xl active:scale-95'
                }
              `}
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{t("common.processing", "กำลังดำเนินการ...")}</span>
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    <span>{t("package.submit_application", "ยืนยันการจัดส่ง")}</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={totalCost}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        className="text-sm opacity-90"
                      >
                        (฿{totalCost})
                      </motion.span>
                    </AnimatePresence>
                  </>
                )}
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Cost Row Component
const CostRow = ({ label, value, icon, bold = false }) => (
  <div className="flex items-center justify-between text-sm">
    <span className={`flex items-center gap-2 ${bold ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </span>
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className={bold ? 'font-bold text-gray-900 text-lg' : 'font-semibold text-gray-700'}
      >
        ฿{value}
      </motion.span>
    </AnimatePresence>
  </div>
);

export default CostSummaryBar;
