import { useTranslation } from "react-i18next";
import { useState, useRef, useCallback } from "react";
import OptimizedImage from "../Common/OptimizedImage";
import MiniProgressBar from "./MiniProgressBar";

/**
 * OrderCard Component
 * 
 * Displays a single order card with all its details, images, and actions.
 * Supports selection mode for batch operations and long-press for quick actions.
 */
const OrderCard = ({
  item,
  index,
  selectionMode,
  isSelected,
  onToggleSelection,
  onDetail,
  onEdit,
  onLogistics,
  onConfirmCancel,
  onImageClick,
  onLongPress,
}) => {
  const { t } = useTranslation();
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimer = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const LONG_PRESS_DURATION = 500; // 500ms
  const MOVE_THRESHOLD = 10; // 10px movement cancels long press

  const isSelectable = selectionMode && item.status === 2;

  // Long press handlers
  const handleTouchStart = useCallback((e) => {
    if (selectionMode || !onLongPress) return;

    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    setIsPressed(true);

    longPressTimer.current = setTimeout(() => {
      // Trigger haptic feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      onLongPress(item);
      setIsPressed(false);
    }, LONG_PRESS_DURATION);
  }, [selectionMode, onLongPress, item]);

  const handleTouchMove = useCallback((e) => {
    if (!longPressTimer.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);

    // Cancel long press if moved too much
    if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      setIsPressed(false);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsPressed(false);
  }, []);

  const getStatusText = (status) => {
    const statusMap = {
      1: t("package.status.not_received", "ยังไม่ได้รับ"),
      2: t("package.status.received", "ได้รับแล้ว"),
      3: t("package.status.pending_verify", "รอตรวจสอบ"),
      4: t("package.status.verified", "ตรวจสอบแล้ว"),
      5: t("package.status.pending_pack", "รอแพ็ค"),
      6: t("package.status.packed", "แพ็คแล้ว"),
      7: t("package.status.pending_payment", "รอชำระเงิน"),
      8: t("package.status.shipped", "จัดส่งแล้ว"),
      "-1": t("package.status.issue", "มีปัญหา")
    };
    return statusMap[status] || t("package.status.unknown", "ไม่ทราบสถานะ");
  };

  const getStatusColor = (status) => {
    const colorMap = {
      1: "bg-gray-100 text-gray-700",
      2: "bg-blue-100 text-blue-700",
      3: "bg-yellow-100 text-yellow-700",
      4: "bg-green-100 text-green-700",
      5: "bg-orange-100 text-orange-700",
      6: "bg-purple-100 text-purple-700",
      7: "bg-red-100 text-red-700",
      8: "bg-green-100 text-green-700",
      "-1": "bg-red-100 text-red-700"
    };
    return colorMap[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div
      onClick={() => isSelectable && onToggleSelection(item.id, item)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`bg-white rounded-2xl p-4 shadow-sm border transition-all relative ${
        isSelectable && isSelected
          ? 'border-primary-500 border-2 bg-primary-50'
          : 'border-gray-100'
      } ${isSelectable ? 'cursor-pointer active:scale-[0.98]' : ''} ${selectionMode && !isSelectable ? 'opacity-50' : ''} ${
        isPressed ? 'scale-[0.98] bg-gray-50' : ''
      }`}
    >
      {selectionMode && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            disabled={!isSelectable}
            className={`w-6 h-6 rounded border-2 text-primary-600 focus:ring-2 focus:ring-primary-200 pointer-events-none ${
              isSelectable ? 'border-primary-500 cursor-pointer' : 'border-gray-300 cursor-not-allowed'
            }`}
            readOnly
          />
        </div>
      )}

      <div className={`flex justify-between items-start mb-3 pb-3 border-b border-gray-50 ${selectionMode ? 'ml-8' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-1.5 rounded-lg">
            <OptimizedImage 
              src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img24.png" 
              className="w-4 h-4" 
              alt="warehouse" 
            />
          </div>
          <span className="font-bold text-gray-800 text-sm">{item.storage?.shop_name || t("package.labels.warehouse")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(item.status)}`}>
            {getStatusText(item.status)}
          </span>
          {!selectionMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDetail(item);
              }}
              className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100"
            >
              {t("common.view_detail")}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <InfoItem label={t("package.labels.tracking_no", "เลขพัสดุ")} value={item.express_num} />
        {(item.mark || item.usermark) && (
          <InfoItem label={t("package.labels.mark", "唛头")} value={item.mark || item.usermark} />
        )}
        <InfoItem label={t("package.labels.country")} value={item.country?.title || t("package.labels.not_provided")} />
        <InfoItem label={t("package.labels.items")} value={item.class_name} />
        {(item.weight || item.length || item.width || item.height) && (
          <InfoItem 
            label={t("package.labels.dimensions", "ขนาด/น้ำหนัก")} 
            value={`${item.length || '-'}×${item.width || '-'}×${item.height || '-'} cm / ${item.weight || '-'} kg`} 
          />
        )}
        <InfoItem label={t("package.labels.report_time")} value={item.created_time} />
      </div>

      {/* Mini Progress Bar */}
      <div className="mb-4 pb-4 border-b border-gray-50">
        <MiniProgressBar status={item.status} />
      </div>

      {item.images && item.images.length > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-50">
          <p className="text-xs text-gray-500 mb-2">{t("package.labels.goods_images", "รูปสินค้า")}:</p>
          <div className="flex gap-2 overflow-x-auto">
            {item.images.map((img, idx) => (
              <OptimizedImage
                key={idx}
                src={img} 
                alt={`Package ${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick(item.images, idx);
                }}
                className="w-20 h-20 object-cover rounded-lg bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {!selectionMode && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
          {item.status != -1 && item.status != 3 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirmCancel(item.id);
                }}
                className="flex-1 text-xs font-medium text-red-500 bg-red-50 py-2 rounded-lg hover:bg-red-100"
              >
                {t("package.cancel_report")}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="flex-1 text-xs font-medium text-gray-600 bg-gray-100 py-2 rounded-lg hover:bg-gray-200"
              >
                {t("package.edit_report")}
              </button>
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLogistics(item.express_num);
            }}
            className="flex-1 text-xs font-medium text-blue-600 bg-blue-50 py-2 rounded-lg hover:bg-blue-100"
          >
            {t("package.view_logistics")}
          </button>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-500">{label}:</span>
    <span className="text-gray-800 font-medium truncate max-w-[60%]">{value}</span>
  </div>
);

export default OrderCard;
