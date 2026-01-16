import { useTranslation } from 'react-i18next';

/**
 * LocalStatisticsPanel Component
 * 
 * Displays statistics calculated from local order data.
 * Shows totals, averages, and distributions.
 */
const LocalStatisticsPanel = ({ statistics }) => {
  const { t } = useTranslation();

  if (!statistics || statistics.totalOrders === 0) {
    return null;
  }

  const {
    totalOrders,
    totalAmount,
    totalWeight,
    avgPrice,
    avgWeight,
    statusDistribution,
    warehouseDistribution,
    countryDistribution,
  } = statistics;

  // Get top 5 warehouses
  const topWarehouses = Object.entries(warehouseDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get status labels
  const getStatusLabel = (status) => {
    const statusMap = {
      1: t("package.status.not_received", "ยังไม่ได้รับ"),
      2: t("package.status.received", "ได้รับแล้ว"),
      3: t("package.status.pending_verify", "รอตรวจสอบ"),
      4: t("package.status.verified", "ตรวจสอบแล้ว"),
      5: t("package.status.pending_pack", "รอแพ็ค"),
      6: t("package.status.packed", "แพ็คแล้ว"),
      7: t("package.status.pending_payment", "รอชำระเงิน"),
      8: t("package.status.shipped", "จัดส่งแล้ว"),
      "-1": t("package.status.issue", "มีปัญหา")
    };
    return statusMap[status] || t("package.status.unknown", "ไม่ทราบสถานะ");
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
      <h3 className="text-gray-800 font-bold text-base mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {t("statistics.title", "สถิติหน้านี้")}
      </h3>

      {/* 重点指标 - 重量和数量 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">⚖️</span>
            <p className="text-blue-600 text-xs font-medium">{t("statistics.total_weight", "น้ำหนักรวม")}</p>
          </div>
          <p className="text-blue-900 text-2xl font-bold">{totalWeight.toFixed(2)} kg</p>
          {avgWeight > 0 && (
            <p className="text-blue-600 text-xs mt-1">
              {t("statistics.avg_weight", "เฉลี่ย")}: {avgWeight.toFixed(2)} kg
            </p>
          )}
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📦</span>
            <p className="text-green-600 text-xs font-medium">{t("statistics.total_orders", "จำนวนพัสดุ")}</p>
          </div>
          <p className="text-green-900 text-2xl font-bold">{totalOrders}</p>
          {totalAmount > 0 && (
            <p className="text-green-600 text-xs mt-1">
              {t("statistics.total_amount", "มูลค่า")}: ฿{totalAmount.toFixed(0)}
            </p>
          )}
        </div>
      </div>

      {/* 仓库分布 - 简化显示 */}
      {topWarehouses.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-gray-700 text-sm font-medium mb-2 flex items-center gap-1">
            <span>🏢</span>
            {t("statistics.warehouse_distribution", "คลังสินค้า")}
          </p>
          <div className="space-y-1.5">
            {topWarehouses.slice(0, 3).map(([warehouse, count], index) => (
              <div key={warehouse} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 flex-1 truncate">{warehouse}</span>
                <span className="text-gray-900 font-semibold ml-2">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalStatisticsPanel;
