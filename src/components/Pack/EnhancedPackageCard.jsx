import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import OptimizedImage from '../Common/OptimizedImage';

/**
 * Enhanced Package Card - Logistics Theme
 * 
 * Compact card for pack page with shipping-ready visuals
 */
const EnhancedPackageCard = ({ pkg, onImageClick }) => {
  const { t } = useTranslation();
  const images = pkg.images || [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-sm border-2 border-blue-100 overflow-hidden"
    >
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            📦
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-blue-900 text-sm truncate">
              {pkg.express_num}
            </p>
            <p className="text-xs text-blue-600">พร้อมจัดส่ง</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Info chips */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <InfoChip 
            icon="⚖️" 
            label={t("package.labels.weight", "น้ำหนัก")}
            value={pkg.weight ? `${pkg.weight}kg` : '-'}
          />
          <InfoChip 
            icon="📏" 
            label={t("package.labels.dimensions", "ขนาด")}
            value={pkg.length && pkg.width ? `${pkg.length}×${pkg.width}` : '-'}
          />
          <InfoChip 
            icon="🏢" 
            label={t("package.labels.warehouse", "คลัง")}
            value={pkg.storage?.shop_name?.substring(0, 6) || '-'}
          />
        </div>

        {/* Images */}
        {images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                onClick={() => onImageClick(images, idx)}
                className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <OptimizedImage
                  src={img}
                  alt={`Package ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {images.length > 4 && (
              <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                +{images.length - 4}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Info Chip Component
const InfoChip = ({ icon, label, value }) => (
  <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
    <div className="text-sm mb-0.5">{icon}</div>
    <p className="text-[10px] text-gray-500 mb-0.5">{label}</p>
    <p className="text-xs font-bold text-gray-900 truncate">{value}</p>
  </div>
);

export default EnhancedPackageCard;
