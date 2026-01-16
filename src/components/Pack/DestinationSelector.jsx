import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Destination Selector Component
 * 
 * Green-themed address selection
 */
const DestinationSelector = ({ addresses, selectedAddressId, onSelect, onAddNew }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          📍
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-base">
            {t("package.delivery_address", "ปลายทางการจัดส่ง")}
          </h3>
          <p className="text-xs text-gray-500">
            ที่อยู่ที่จะรับพัสดุ
          </p>
        </div>
      </div>

      {/* Address Options */}
      <div className="space-y-2">
        {addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm mb-3">ยังไม่มีที่อยู่</p>
            <button
              onClick={onAddNew}
              className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
            >
              + เพิ่มที่อยู่แรก
            </button>
          </div>
        ) : (
          <>
            {addresses.map((addr) => {
              const isSelected = selectedAddressId === addr.address_id;

              return (
                <motion.div
                  key={addr.address_id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(addr.address_id)}
                  className={`
                    relative p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-green-500 bg-green-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0
                      ${isSelected ? 'bg-green-500' : 'bg-gray-100'}
                    `}>
                      <span className={isSelected ? 'filter brightness-0 invert' : ''}>
                        {addr.is_default ? '🏠' : '📍'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-bold text-sm ${isSelected ? 'text-green-900' : 'text-gray-800'}`}>
                          {addr.name}
                        </p>
                        {addr.is_default === 1 && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] rounded-full font-medium">
                            ค่าเริ่มต้น
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                        {addr.detail}
                      </p>
                      {addr.phone && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span>📱</span>
                          <span>{addr.phone}</span>
                        </p>
                      )}
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Add New Button */}
            <button
              onClick={onAddNew}
              className="w-full py-3 border-2 border-dashed border-green-300 rounded-xl text-green-600 font-medium hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span>
              <span>เพิ่มที่อยู่ใหม่</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DestinationSelector;
