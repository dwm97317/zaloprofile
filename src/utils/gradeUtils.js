/**
 * Grade Utility Functions
 * 会员等级相关工具函数
 */

/**
 * 默认等级配置 - 当用户无等级时使用
 */
export const DEFAULT_GRADE = {
  grade_id: 0,
  name: '普通会员',
  weight: 0,
  upgrade: { expend_money: 0 },
  equity: { discount: 10 },
  status: 1
};

/**
 * 预设等级列表 - 用于前端展示
 */
export const PRESET_GRADES = [
  { 
    grade_id: 1, 
    name: '普通会员', 
    weight: 1, 
    upgrade: { expend_money: 0 }, 
    equity: { discount: 10 } 
  },
  { 
    grade_id: 2, 
    name: '黄金会员', 
    weight: 10, 
    upgrade: { expend_money: 1000 }, 
    equity: { discount: 9.5 } 
  },
  { 
    grade_id: 3, 
    name: '铂金会员', 
    weight: 20, 
    upgrade: { expend_money: 5000 }, 
    equity: { discount: 9 } 
  },
  { 
    grade_id: 4, 
    name: '钻石会员', 
    weight: 30, 
    upgrade: { expend_money: 10000 }, 
    equity: { discount: 8.5 } 
  }
];

/**
 * 计算升级进度百分比
 * @param {number} currentExpend - 当前累计消费
 * @param {number} nextLevelRequirement - 下一等级所需金额
 * @returns {number} 进度百分比 (0-100)
 */
export function calculateProgress(currentExpend, nextLevelRequirement) {
  if (nextLevelRequirement <= 0) return 100;
  return Math.min((currentExpend / nextLevelRequirement) * 100, 100);
}

/**
 * 计算距离下一等级还需消费金额
 * @param {number} currentExpend - 当前累计消费
 * @param {number} nextLevelRequirement - 下一等级所需金额
 * @returns {number} 还需消费金额
 */
export function getAmountToNextLevel(currentExpend, nextLevelRequirement) {
  return Math.max(nextLevelRequirement - currentExpend, 0);
}

/**
 * 计算折扣后价格
 * @param {number} originalPrice - 原价
 * @param {number} discountRate - 折扣率 (0-10)
 * @returns {number} 折扣后价格 (保留2位小数)
 */
export function getDiscountPrice(originalPrice, discountRate) {
  return Number((originalPrice * (discountRate / 10)).toFixed(2));
}

/**
 * 根据等级权重获取等级样式配置
 * @param {number} weight - 等级权重
 * @returns {Object} 样式配置 {color, bgColor, icon, level}
 */
export function getGradeStyle(weight) {
  if (weight >= 30) {
    return { 
      color: '#8B5CF6', 
      bgColor: '#EDE9FE', 
      icon: '💎', 
      level: 'diamond' 
    };
  } else if (weight >= 20) {
    return { 
      color: '#6366F1', 
      bgColor: '#E0E7FF', 
      icon: '🏆', 
      level: 'platinum' 
    };
  } else if (weight >= 10) {
    return { 
      color: '#F59E0B', 
      bgColor: '#FEF3C7', 
      icon: '🥇', 
      level: 'gold' 
    };
  } else {
    return { 
      color: '#6B7280', 
      bgColor: '#F3F4F6', 
      icon: '👤', 
      level: 'normal' 
    };
  }
}

/**
 * 验证等级数据完整性
 * @param {Object} grade - 等级对象
 * @returns {boolean} 是否有效
 */
export function validateGradeData(grade) {
  if (!grade) return false;
  return (
    typeof grade.grade_id === 'number' &&
    typeof grade.name === 'string' &&
    typeof grade.weight === 'number' &&
    grade.upgrade && typeof grade.upgrade.expend_money === 'number' &&
    grade.equity && typeof grade.equity.discount === 'number'
  );
}
