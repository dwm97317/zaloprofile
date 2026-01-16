import { motion } from 'framer-motion';
import ProgressSteps from './ProgressSteps';

/**
 * Pack Hero Section Component
 * 
 * Logistics-themed hero with animated background and progress steps
 */
const PackHeroSection = ({ currentStep = 1, packageCount = 0 }) => {
  const floatingIcons = ['🚚', '✈️', '🚢', '📦', '🌍', '📍', '🎁'];

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
      {/* Animated floating icons background */}
      <div className="absolute inset-0 opacity-10">
        {floatingIcons.map((icon, index) => (
          <motion.div
            key={index}
            className="absolute text-4xl"
            initial={{ 
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
            }}
            animate={{
              x: [
                Math.random() * 100 + '%',
                Math.random() * 100 + '%',
                Math.random() * 100 + '%',
              ],
              y: [
                Math.random() * 100 + '%',
                Math.random() * 100 + '%',
                Math.random() * 100 + '%',
              ],
              rotate: [0, 360],
            }}
            transition={{
              duration: 20 + index * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {icon}
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <span>🚚</span>
            <span>เตรียมจัดส่งพัสดุ</span>
          </h1>
          <p className="text-blue-100 text-sm">
            เลือกเส้นทางและปลายทางของคุณ ({packageCount} พัสดุ)
          </p>
        </motion.div>

        {/* Progress Steps */}
        <ProgressSteps currentStep={currentStep} />
      </div>
    </div>
  );
};

export default PackHeroSection;
