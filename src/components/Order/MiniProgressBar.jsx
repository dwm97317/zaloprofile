import { useTranslation } from 'react-i18next';

/**
 * MiniProgressBar Component
 * 
 * Compact progress bar for order cards showing status progression
 * 
 * @param {Object} props
 * @param {number} props.status - Current order status
 * @param {string} props.className - Additional CSS classes
 */
export function MiniProgressBar({ status, className = '' }) {
  const { t } = useTranslation();

  // Define status progression (same as OrderTimeline)
  const statusFlow = [1, 2, 3, 4, 5, 7, 8, 9];

  // Calculate progress percentage
  const currentIndex = statusFlow.indexOf(status);
  const progressPercentage = currentIndex >= 0 
    ? ((currentIndex + 1) / statusFlow.length) * 100 
    : 0;

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 1: // Forecast
        return 'from-gray-400 to-gray-500';
      case 2: // Received
        return 'from-blue-400 to-blue-500';
      case 3: // Checked
        return 'from-green-400 to-green-500';
      case 4: // Awaiting pack
        return 'from-yellow-400 to-yellow-500';
      case 5: // Packed
        return 'from-orange-400 to-orange-500';
      case 7: // Awaiting payment
        return 'from-purple-400 to-purple-500';
      case 8: // Shipped
        return 'from-indigo-400 to-indigo-500';
      case 9: // Completed
        return 'from-green-500 to-emerald-600';
      case -1: // Issue
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      1: t('status.forecast', 'พยากรณ์'),
      2: t('status.received', 'ถึงคลัง'),
      3: t('status.checked', 'ตรวจสอบแล้ว'),
      4: t('status.awaiting_pack', 'รอแพ็ค'),
      5: t('status.packed', 'แพ็คแล้ว'),
      7: t('status.awaiting_payment', 'รอชำระ'),
      8: t('status.shipped', 'จัดส่งแล้ว'),
      9: t('status.completed', 'เสร็จสิ้น'),
      '-1': t('status.issue', 'มีปัญหา'),
    };
    return statusMap[status] || t('status.unknown', 'ไม่ทราบ');
  };

  const colorClass = getStatusColor(status);
  const statusLabel = getStatusLabel(status);

  return (
    <div className={`relative ${className}`}>
      {/* Progress bar background */}
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        {/* Progress bar fill */}
        <div
          className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-500 ease-out`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Status text and percentage */}
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-gray-600 font-medium">
          {statusLabel}
        </span>
        <span className={`text-xs font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>
          {Math.round(progressPercentage)}%
        </span>
      </div>
    </div>
  );
}

export default MiniProgressBar;
