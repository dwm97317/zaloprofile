import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Order Action Bar Component
 * 
 * Sticky action bar with context-aware buttons
 */
const OrderActionBar = ({ status, isPay, loading, onCancel, onPay, onTrack }) => {
  const { t } = useTranslation();

  // Determine which buttons to show
  const getActions = () => {
    // Cancelled - No actions
    if (status === -1) {
      return null;
    }

    // Pending payment - Show Pay button
    if (status === 2 && isPay === 2) {
      return (
        <ActionButton
          variant="primary"
          icon="💳"
          onClick={onPay}
          disabled={loading}
          fullWidth
        >
          {t("order.buttons.pay", "ชำระเงิน")}
        </ActionButton>
      );
    }

    // Can cancel (before shipped)
    if (status < 6) {
      return (
        <ActionButton
          variant="danger"
          icon="❌"
          onClick={onCancel}
          disabled={loading}
          fullWidth
        >
          {t("order.buttons.cancel", "ยกเลิกคำสั่งซื้อ")}
        </ActionButton>
      );
    }

    // Shipped or completed - Show Track button
    if (status >= 6 && onTrack) {
      return (
        <ActionButton
          variant="success"
          icon="🚚"
          onClick={onTrack}
          disabled={loading}
          fullWidth
        >
          {t("order.buttons.track", "ติดตามพัสดุ")}
        </ActionButton>
      );
    }

    return null;
  };

  const actions = getActions();

  if (!actions) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.7, type: "spring" }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] border-t border-gray-100 z-30"
    >
      <div className="max-w-3xl mx-auto">
        {actions}
      </div>
    </motion.div>
  );
};

// Action Button Component
const ActionButton = ({ variant = 'primary', icon, onClick, disabled, fullWidth, children }) => {
  const variants = {
    primary: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      hover: 'hover:from-blue-600 hover:to-blue-700',
      shadow: 'shadow-lg shadow-blue-200',
      disabled: 'from-gray-300 to-gray-400'
    },
    danger: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      hover: 'hover:from-red-600 hover:to-red-700',
      shadow: 'shadow-lg shadow-red-200',
      disabled: 'from-gray-300 to-gray-400'
    },
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      hover: 'hover:from-green-600 hover:to-green-700',
      shadow: 'shadow-lg shadow-green-200',
      disabled: 'from-gray-300 to-gray-400'
    }
  };

  const config = variants[variant];

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${fullWidth ? 'w-full' : ''}
        flex items-center justify-center gap-2
        py-4 px-6 rounded-2xl
        text-white font-bold text-base
        transition-all
        ${disabled ? `bg-gradient-to-r ${config.disabled} cursor-not-allowed` : `${config.bg} ${config.hover} ${config.shadow}`}
      `}
    >
      {disabled ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{t("common.loading", "กำลังโหลด")}...</span>
        </>
      ) : (
        <>
          <span className="text-2xl">{icon}</span>
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
};

export default OrderActionBar;
