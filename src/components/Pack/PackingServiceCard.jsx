import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Packing Service Card Component
 * 
 * Purple-themed service options with checkboxes
 */
const PackingServiceCard = ({ services, selectedServiceIds, onToggle }) => {
  const { t } = useTranslation();

  // Get service icon
  const getServiceIcon = (service) => {
    const name = (service.name || '').toLowerCase();
    if (name.includes('insurance') || name.includes('ประกัน')) return '🛡️';
    if (name.includes('fragile') || name.includes('ของเปราะบาง')) return '⚠️';
    if (name.includes('express') || name.includes('ด่วน')) return '⚡';
    if (name.includes('photo') || name.includes('รูปถ่าย')) return '📸';
    if (name.includes('wrap') || name.includes('ห่อ')) return '🎁';
    return '📦';
  };

  if (services.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          🎁
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-base">
            {t("package.packing_services", "บริการเสริม")}
          </h3>
          <p className="text-xs text-gray-500">
            เลือกบริการเพิ่มเติม (ไม่บังคับ)
          </p>
        </div>
      </div>

      {/* Service Options */}
      <div className="space-y-2">
        {services.map((service) => {
          const isSelected = selectedServiceIds.includes(service.id);

          return (
            <motion.label
              key={service.id}
              whileTap={{ scale: 0.98 }}
              className={`
                relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${isSelected 
                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                }
              `}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(service.id)}
                className="sr-only"
              />
              
              {/* Custom Checkbox */}
              <div className={`
                w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all
                ${isSelected 
                  ? 'bg-purple-500 border-purple-500' 
                  : 'bg-white border-gray-300'
                }
              `}>
                {isSelected && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </div>

              {/* Icon */}
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0
                ${isSelected ? 'bg-purple-500' : 'bg-gray-100'}
              `}>
                <span className={isSelected ? 'filter brightness-0 invert' : ''}>
                  {getServiceIcon(service)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${isSelected ? 'text-purple-900' : 'text-gray-800'}`}>
                  {service.name}
                </p>
                {service.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {service.description}
                  </p>
                )}
              </div>

              {/* Price */}
              {service.price && (
                <div className={`text-right ${isSelected ? 'text-purple-600' : 'text-gray-600'}`}>
                  <p className="text-xs text-gray-500">ราคา</p>
                  <p className="font-bold">฿{service.price}</p>
                </div>
              )}
            </motion.label>
          );
        })}
      </div>
    </div>
  );
};

export default PackingServiceCard;
