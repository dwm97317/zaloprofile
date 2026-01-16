import { motion } from 'framer-motion';

/**
 * Order Status Badge Component
 * 
 * Visual status indicator with icon and color coding
 */
const OrderStatusBadge = ({ status, isPay }) => {
  const getStatusConfig = () => {
    // Map status to visual config
    if (status === -1) {
      return {
        icon: '❌',
        label: 'ยกเลิก',
        gradient: 'from-red-400 to-red-600',
        bg: 'bg-red-50',
        text: 'text-red-700',
        progress: 0
      };
    }
    
    if (status === 1) {
      return {
        icon: '⏱️',
        label: 'รอตรวจสอบ',
        gradient: 'from-gray-400 to-gray-600',
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        progress: 10
      };
    }
    
    if (status === 2 && isPay === 2) {
      return {
        icon: '💳',
        label: 'รอชำระเงิน',
        gradient: 'from-orange-400 to-orange-600',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        progress: 30
      };
    }
    
    if (status === 3 && isPay === 1) {
      return {
        icon: '✅',
        label: 'ชำระแล้ว',
        gradient: 'from-blue-400 to-blue-600',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        progress: 50
      };
    }
    
    if ((status === 4 || status === 5) && isPay === 1) {
      return {
        icon: '📦',
        label: 'กำลังแพ็ค',
        gradient: 'from-purple-400 to-purple-600',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        progress: 70
      };
    }
    
    if (status === 6 && isPay === 1) {
      return {
        icon: '🚚',
        label: 'จัดส่งแล้ว',
        gradient: 'from-green-400 to-green-600',
        bg: 'bg-green-50',
        text: 'text-green-700',
        progress: 90
      };
    }
    
    if (status === 7 && isPay === 1) {
      return {
        icon: '📍',
        label: 'ได้รับแล้ว',
        gradient: 'from-green-500 to-green-700',
        bg: 'bg-green-50',
        text: 'text-green-700',
        progress: 95
      };
    }
    
    if (status === 8 && isPay === 1) {
      return {
        icon: '✅',
        label: 'เสร็จสิ้น',
        gradient: 'from-green-500 to-green-700',
        bg: 'bg-green-50',
        text: 'text-green-700',
        progress: 100
      };
    }
    
    return {
      icon: '📋',
      label: 'ไม่ทราบสถานะ',
      gradient: 'from-gray-400 to-gray-600',
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      progress: 0
    };
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${config.bg} ${config.text} font-bold text-sm`}>
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="text-base"
      >
        {config.icon}
      </motion.span>
      <span>{config.label}</span>
    </div>
  );
};

export default OrderStatusBadge;
export { OrderStatusBadge };
