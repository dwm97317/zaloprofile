import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

/**
 * 浮动操作栏组件
 * 
 * 用于批量选择模式下的操作
 * 特性：
 * - 底部居中浮动
 * - 显示选中数量
 * - 快速操作按钮
 * - 进入/退出动画
 */
const FloatingActionBar = ({
  visible,
  selectedCount,
  totalCount,
  onApplyPacking,
  onCancel,
  onSelectAll,
  onDeselectAll,
  warehouseValidation,
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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* 仓库验证提示 */}
            {warehouseValidation && !warehouseValidation.valid && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                className="bg-red-50 border-b border-red-100"
              >
                <div className="px-4 py-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-xs text-red-700">
                    <p className="font-medium mb-1">
                      {t("package.warehouse_notice.error")}
                    </p>
                    <p className="text-red-600">
                      {warehouseValidation.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 成功验证提示 */}
            {warehouseValidation && warehouseValidation.valid && selectedCount > 0 && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                className="bg-green-50 border-b border-green-100"
              >
                <div className="px-4 py-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-green-700 font-medium">
                    {t("package.warehouse_notice.same_warehouse")}: {warehouseValidation.warehouseName}
                  </p>
                </div>
              </motion.div>
            )}

            {/* 主操作区 */}
            <div className="px-6 py-4">
              <div className="flex items-center gap-4">
                {/* 选中数量显示 */}
                <div className="flex items-center gap-3">
                  <motion.div
                    key={selectedCount}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <span className="text-white font-bold text-lg">
                      {selectedCount}
                    </span>
                  </motion.div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {t("package.select_pack.selected")}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedCount} / {totalCount}
                    </p>
                  </div>
                </div>

                {/* 分隔线 */}
                <div className="w-px h-12 bg-gray-200" />

                {/* 快速操作按钮 */}
                <div className="flex-1 flex gap-2">
                  {selectedCount === totalCount ? (
                    <button
                      onClick={onDeselectAll}
                      className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      {t("package.select_pack.deselect_all")}
                    </button>
                  ) : (
                    <button
                      onClick={onSelectAll}
                      className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      {t("package.select_pack.select_all")}
                    </button>
                  )}
                </div>
              </div>

              {/* 底部按钮组 */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all active:scale-95"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={onApplyPacking}
                  disabled={selectedCount === 0 || (warehouseValidation && !warehouseValidation.valid)}
                  className={`
                    flex-1 py-3.5 rounded-xl font-bold transition-all shadow-lg
                    ${selectedCount === 0 || (warehouseValidation && !warehouseValidation.valid)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-xl active:scale-95'
                    }
                  `}
                >
                  <span className="flex items-center justify-center gap-2">
                    {t("package.select_pack.next")}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingActionBar;
