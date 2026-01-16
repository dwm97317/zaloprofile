import { motion } from 'framer-motion';

/**
 * ProgressSteps Component
 * 
 * Visual progress indicator for the shipping journey
 */
const ProgressSteps = ({ currentStep = 1 }) => {
  const steps = [
    { id: 1, icon: '📦', label: 'เลือกพัสดุ' },
    { id: 2, icon: '🛣️', label: 'เส้นทาง' },
    { id: 3, icon: '📍', label: 'ปลายทาง' },
    { id: 4, icon: '✅', label: 'ยืนยัน' }
  ];

  return (
    <div className="flex items-center justify-between max-w-2xl mx-auto">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          {/* Step Circle */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center"
          >
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center text-xl
                transition-all duration-300
                ${step.id <= currentStep
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/20 text-white/60'
                }
              `}
            >
              {step.icon}
            </div>
            <p
              className={`
                text-xs mt-2 font-medium transition-colors
                ${step.id <= currentStep ? 'text-white' : 'text-white/60'}
              `}
            >
              {step.label}
            </p>
          </motion.div>

          {/* Arrow */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-2 bg-white/20 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: step.id < currentStep ? '100%' : '0%' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="absolute inset-0 bg-white"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;
