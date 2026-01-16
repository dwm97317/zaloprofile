import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

/**
 * 增强版Tab导航栏
 * 
 * 特性：
 * - 胶囊式设计
 * - 渐变背景
 * - 数字徽章
 * - 滑动指示器
 */
const EnhancedTabBar = ({ tabs, activeTab, onTabChange, counts }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 px-4 py-3 border-b border-gray-100">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = counts?.[tab.countKey] || 0;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative px-5 py-2.5 rounded-full font-semibold text-sm
                transition-all duration-300 whitespace-nowrap flex-shrink-0
                ${isActive
                  ? 'text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                }
              `}
              whileTap={{ scale: 0.95 }}
              layout
            >
              {/* 活动状态渐变背景 */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* 内容 */}
              <span className="relative z-10 flex items-center gap-2">
                {/* Tab图标 */}
                <span className="text-base">
                  {getTabIcon(tab.id)}
                </span>
                
                {/* Tab标签 */}
                <span>{tab.label}</span>

                {/* 数字徽章 */}
                <motion.span
                  key={count}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className={`
                    px-2 py-0.5 rounded-full text-xs font-bold
                    ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-primary-50 text-primary-600'
                    }
                  `}
                >
                  {count}
                </motion.span>
              </span>

              {/* 新消息脉冲动画 */}
              {count > 0 && !isActive && (
                <motion.span
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// Tab图标映射
const getTabIcon = (tabId) => {
  const icons = {
    2: "✅",   // 已入库
    8: "🚚",   // 已发货
    1: "⏱️",   // 待入库
    "-1": "⚠️" // 问题件
  };
  return icons[tabId] || "📦";
};

export default EnhancedTabBar;
