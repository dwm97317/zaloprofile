import { motion } from 'framer-motion';

/**
 * Order Progress Bar Component
 * 
 * Visual progress indicator for order journey
 */
const OrderProgressBar = ({ status, isPay }) => {
  const getProgress = () => {
    if (status === -1) return 0;
    if (status === 1) return 10;
    if (status === 2 && isPay === 2) return 30;
    if (status === 3 && isPay === 1) return 50;
    if ((status === 4 || status === 5) && isPay === 1) return 70;
    if (status === 6 && isPay === 1) return 90;
    if (status === 7 && isPay === 1) return 95;
    if (status === 8 && isPay === 1) return 100;
    return 0;
  };

  const getColor = () => {
    if (status === -1) return 'bg-red-500';
    if (status === 2 && isPay === 2) return 'bg-orange-500';
    if ((status === 4 || status === 5) && isPay === 1) return 'bg-purple-500';
    if (status >= 6 && isPay === 1) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const progress = getProgress();
  const colorClass = getColor();

  return (
    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full ${colorClass}`}
      />
    </div>
  );
};

export default OrderProgressBar;
