import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Order Journey Timeline Component
 * 
 * Visual timeline showing order progress through 6 steps
 */
const OrderJourneyTimeline = ({ status, isPay }) => {
  const { t } = useTranslation();

  const steps = [
    {
      id: 1,
      icon: '📋',
      title: t("timeline.reported", "แจ้งพัสดุ"),
      description: t("timeline.reported_desc", "แจ้งข้อมูลพัสดุเรียบร้อย")
    },
    {
      id: 2,
      icon: '📦',
      title: t("timeline.received", "เข้าคลัง"),
      description: t("timeline.received_desc", "พัสดุเข้าคลังแล้ว")
    },
    {
      id: 3,
      icon: '💳',
      title: t("timeline.paid", "ชำระเงิน"),
      description: t("timeline.paid_desc", "ชำระค่าจัดส่งแล้ว")
    },
    {
      id: 4,
      icon: '📦',
      title: t("timeline.packing", "แพ็คพัสดุ"),
      description: t("timeline.packing_desc", "กำลังแพ็คพัสดุ")
    },
    {
      id: 5,
      icon: '🚚',
      title: t("timeline.shipped", "จัดส่ง"),
      description: t("timeline.shipped_desc", "พัสดุออกจัดส่งแล้ว")
    },
    {
      id: 6,
      icon: '✅',
      title: t("timeline.completed", "เสร็จสิ้น"),
      description: t("timeline.completed_desc", "ได้รับพัสดุแล้ว")
    }
  ];

  // Determine current step based on status
  const getCurrentStep = () => {
    if (status === -1) return 0; // Cancelled
    if (status === 1) return 1; // Reported
    if (status === 2) return 2; // Received
    if (status === 3 && isPay === 1) return 3; // Paid
    if ((status === 4 || status === 5) && isPay === 1) return 4; // Packing
    if (status === 6 && isPay === 1) return 5; // Shipped
    if (status >= 7 && isPay === 1) return 6; // Completed
    return 1;
  };

  const currentStep = getCurrentStep();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">🚀</span>
          {t("timeline.title", "สถานะพัสดุ")}
        </h3>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <div className="relative">
          {/* Background Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
          
          {/* Progress Line */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-600"
          />

          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const isActive = index < currentStep;
              const isCurrent = index === currentStep - 1;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="relative flex items-start gap-4"
                >
                  {/* Icon Circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.4, type: "spring" }}
                    className={`
                      relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-xl
                      transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-br from-blue-400 to-purple-600 shadow-lg' 
                        : 'bg-gray-100'
                      }
                      ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}
                    `}
                  >
                    <span className={isActive ? 'filter brightness-0 invert' : ''}>
                      {step.icon}
                    </span>
                    
                    {/* Pulse animation for current step */}
                    {isCurrent && (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-blue-500"
                      />
                    )}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h4 className={`
                      text-sm font-bold mb-0.5
                      ${isActive ? 'text-gray-900' : 'text-gray-400'}
                    `}>
                      {step.title}
                    </h4>
                    <p className={`
                      text-xs
                      ${isActive ? 'text-gray-600' : 'text-gray-400'}
                    `}>
                      {step.description}
                    </p>
                  </div>

                  {/* Checkmark for completed steps */}
                  {isActive && !isCurrent && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, delay: index * 0.1 + 0.5 }}
                      className="mt-2"
                    >
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderJourneyTimeline;
