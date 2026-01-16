import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Shipping Route Selector Component
 * 
 * Orange-themed route selection with transport icons
 */
const ShippingRouteSelector = ({ lines, selectedLineId, onSelect }) => {
  const { t } = useTranslation();

  // Get transport icon based on line name/type
  const getRouteIcon = (line) => {
    const name = (line.name || line.line_name || '').toLowerCase();
    if (name.includes('air') || name.includes('plane') || name.includes('เครื่องบิน')) return '✈️';
    if (name.includes('sea') || name.includes('ship') || name.includes('เรือ')) return '🚢';
    if (name.includes('express') || name.includes('ด่วน')) return '⚡';
    return '🚚';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          🚚
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-base">
            {t("package.shipping_line", "เส้นทางการจัดส่ง")}
          </h3>
          <p className="text-xs text-gray-500">
            เลือกวิธีการจัดส่งของคุณ
          </p>
        </div>
      </div>

      {/* Route Options */}
      <div className="space-y-2">
        {lines.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">ไม่พบเส้นทางการจัดส่ง</p>
          </div>
        ) : (
          lines.map((line) => {
            const lineId = line.id || line.line_id;
            const lineName = line.name || line.line_name;
            const isSelected = selectedLineId === lineId;

            return (
              <motion.div
                key={lineId}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(lineId)}
                className={`
                  relative p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-orange-500 bg-orange-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-xl
                    ${isSelected ? 'bg-orange-500' : 'bg-gray-100'}
                  `}>
                    <span className={isSelected ? 'filter brightness-0 invert' : ''}>
                      {getRouteIcon(line)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${isSelected ? 'text-orange-900' : 'text-gray-800'}`}>
                      {lineName}
                    </p>
                    {line.duration && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        ⏱️ {line.duration}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  {line.price && (
                    <div className={`text-right ${isSelected ? 'text-orange-600' : 'text-gray-600'}`}>
                      <p className="text-xs text-gray-500">ราคา</p>
                      <p className="font-bold">฿{line.price}</p>
                    </div>
                  )}

                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ShippingRouteSelector;
