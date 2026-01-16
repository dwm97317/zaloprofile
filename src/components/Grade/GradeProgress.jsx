import React from 'react';
import { useTranslation } from 'react-i18next';
import { calculateProgress, getAmountToNextLevel } from '../../utils/gradeUtils';

/**
 * GradeProgress Component
 * 等级进度组件 - 显示升级进度条和相关信息
 * 
 * @param {Object} props
 * @param {number} props.currentExpend - 当前累计消费
 * @param {number} props.nextLevelRequirement - 下一等级所需金额
 * @param {boolean} props.isMaxLevel - 是否最高等级
 */
const GradeProgress = ({ currentExpend, nextLevelRequirement, isMaxLevel }) => {
  const { t } = useTranslation();
  
  if (isMaxLevel) {
    return (
      <div className="grade-progress__max text-center py-3 px-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
        <span className="text-purple-600 font-medium">
          {t('grade.max_level')}
        </span>
      </div>
    );
  }
  
  const progress = calculateProgress(currentExpend, nextLevelRequirement);
  const amountToNext = getAmountToNextLevel(currentExpend, nextLevelRequirement);
  
  return (
    <div className="grade-progress space-y-2">
      {/* Progress bar */}
      <div className="grade-progress__bar relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="grade-progress__fill absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Progress info */}
      <div className="grade-progress__info flex justify-between text-xs text-gray-600">
        <span>
          {t('grade.current_expend')}: ¥{currentExpend.toFixed(2)}
        </span>
        <span>
          {t('grade.amount_to_next')}: ¥{amountToNext.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default GradeProgress;
