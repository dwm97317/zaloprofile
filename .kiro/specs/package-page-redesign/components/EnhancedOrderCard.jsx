import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import OptimizedImage from "../../../src/components/Common/OptimizedImage";

/**
 * 增强版包裹卡片组件
 * 
 * 特性：
 * - 左图右文布局
 * - 可折叠详情
 * - 滑动操作菜单
 * - 长按选择
 * - 微动效
 */
const EnhancedOrderCard = ({
  item,
  selectionMode,
  isSelected,
  onToggleSelection,
  onDetail,
  onEdit,
  onTrack,
  onCancel,
  onLongPress,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  // 状态配置
  const statusConfig = {
    1: { 
      gradient: "from-gray-400 to-gray-500",
      icon: "⏱️",
      label: t("package.status.not_received"),
      pulse: true
    },
    2: { 
      gradient: "from-blue-500 to-blue-600",
      icon: "✅",
      label: t("package.status.received"),
      pulse: false
    },
    8: { 
      gradient: "from-green-500 to-green-600",
      icon: "🚚",
      label: t("package.status.shipped"),
      pulse: false
    },
    "-1": { 
      gradient: "from-red-500 to-red-600",
      icon: "⚠️",
      label: t("package.status.issue"),
      pulse: true
    }
  };

  const status = statusConfig[item.status] || statusConfig[1];
  const images = item.images || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileTap={{ scale: selectionMode ? 1 : 0.98 }}
      className={`
        relative bg-white rounded-3xl overflow-hidden shadow-sm
        transition-all duration-300
        ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'}
        ${selectionMode ? 'cursor-pointer' : ''}
      `}
      onClick={() => selectionMode && onToggleSelection(item.id, item)}
    >
      {/* 顶部状态条 */}
      <div className={`h-1 bg-gradient-to-r ${status.gradient}`} />

      <div className="p-4">
        {/* 主内容区 */}
        <div className="flex gap-4 mb-3">
          {/* 左侧：图片预览 */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100">
              {images.length > 0 ? (
                <OptimizedImage
                  src={images[0]}
                  alt="Package"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  📦
                </div>
              )}
            </div>
            
            {/* 图片数量徽章 */}
            {images.length > 1 && (
              <div className="absolute -bottom-1 -right-1 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg">
                +{images.length - 1}
              </div>
            )}
            
            {/* 选择模式复选框 */}
            {selectionMode && (
              <div className="absolute -top-2 -left-2">
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${isSelected ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-300'}
                `}>
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：核心信息 */}
          <div className="flex-1 min-w-0">
            {/* 单号 + 状态 */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-xs text-gray-500 mb-1">
                  {t("package.labels.tracking_no")}
                </p>
                <p className="font-bold text-gray-900 truncate text-sm">
                  {item.express_num}
                </p>
              </div>
              
              {/* 状态徽章 */}
              <div className={`
                bg-gradient-to-r ${status.gradient} text-white
                px-3 py-1 rounded-xl flex items-center gap-1.5
                text-xs font-bold shadow-lg flex-shrink-0
                ${status.pulse ? 'animate-pulse' : ''}
              `}>
                <span>{status.icon}</span>
                <span>{status.label}</span>
              </div>
            </div>

            {/* 唛头（如果有） */}
            {(item.mark || item.usermark) && (
              <div className="flex items-center gap-2 mb-2 bg-amber-50 px-3 py-1.5 rounded-lg">
                <span className="text-amber-600">🏷️</span>
                <span className="text-sm font-semibold text-amber-900 truncate">
                  {item.mark || item.usermark}
                </span>
              </div>
            )}

            {/* 关键信息网格 */}
            <div className="grid grid-cols-2 gap-2">
              <InfoChip 
                icon="🏢" 
                label={item.storage?.shop_name || t("package.labels.warehouse")}
              />
              <InfoChip 
                icon="🌍" 
                label={item.country?.title || t("package.labels.not_provided")}
              />
            </div>
          </div>
        </div>

        {/* 可折叠详情区 */}
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? "auto" : 0 }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-3 gap-2 py-3 border-t border-gray-100">
            <MetricCard 
              label={t("package.labels.weight")}
              value={item.weight ? `${item.weight} kg` : "-"}
              icon="⚖️"
            />
            <MetricCard 
              label={t("package.labels.volume")}
              value={item.volume ? `${item.volume} cm³` : "-"}
              icon="📏"
            />
            <MetricCard 
              label={t("package.labels.items")}
              value={item.class_name || "-"}
              icon="📦"
            />
          </div>
        </motion.div>

        {/* 展开/收起按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
        >
          <span>{isExpanded ? t("common.collapse") : t("common.expand")}</span>
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 底部操作栏 */}
        {!selectionMode && (
          <div className="flex gap-2 pt-3 border-t border-gray-50">
            <ActionButton
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
              label={t("common.view_detail")}
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                onDetail(item);
              }}
            />
            <ActionButton
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              }
              label={t("package.view_logistics")}
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onTrack(item.express_num);
              }}
            />
            <ActionButton
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
              label={t("package.edit_report")}
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// 信息芯片组件
const InfoChip = ({ icon, label }) => (
  <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1.5 rounded-lg">
    <span className="text-sm">{icon}</span>
    <span className="text-xs text-gray-700 truncate font-medium">{label}</span>
  </div>
);

// 指标卡片组件
const MetricCard = ({ label, value, icon }) => (
  <div className="text-center">
    <div className="text-2xl mb-1">{icon}</div>
    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
    <p className="text-sm font-bold text-gray-900">{value}</p>
  </div>
);

// 操作按钮组件
const ActionButton = ({ icon, label, variant = "secondary", onClick }) => {
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    ghost: "bg-gray-50 text-gray-600 hover:bg-gray-100"
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-1.5
        py-2.5 rounded-xl text-xs font-medium
        transition-all active:scale-95
        ${variants[variant]}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default EnhancedOrderCard;
