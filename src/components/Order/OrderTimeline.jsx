import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Order Timeline Component
 * 
 * Visual timeline showing package journey
 */
const OrderTimeline = ({ status, isPay }) => {
  const { t } = useTranslation();

  // Define timeline steps
  const getTimelineSteps = () => {
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

    return steps;
  };

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

  const steps = getTimelineSteps();
  const currentStep = getCurrentStep();

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div className="p-4 border-b border-gray-50">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          {t("timeline.title", "สถานะพัสดุ")}
        </h3>
      </div>

      <div className="p-4">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-primary-500 to-primary-600"
          />

          {/* Timeline Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const isActive = index < currentStep;
              const isCurrent = index === currentStep - 1;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start gap-4"
                >
                  {/* Icon Circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                    className={`
                      relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-xl
                      transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg' 
                        : 'bg-gray-100'
                      }
                      ${isCurrent ? 'ring-4 ring-primary-100 scale-110' : ''}
                    `}
                  >
                    <span className={isActive ? 'filter brightness-0 invert' : ''}>
                      {step.icon}
                    </span>
                    
                    {/* Pulse animation for current step */}
                    {isCurrent && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-primary-500"
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
                      transition={{ type: "spring", stiffness: 200 }}
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
    </div>
  );
};

export default OrderTimeline;
