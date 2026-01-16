import React from 'react';
import { useTranslation } from 'react-i18next';
import GradeBadge from './GradeBadge';
import GradeProgress from './GradeProgress';

/**
 * GradeCard Component
 * 等级卡片组件 - 组合徽章、进度和权益展示
 * 
 * @param {Object} props
 * @param {Object|null} props.grade - 等级对象
 * @param {number} props.expendMoney - 累计消费金额
 * @param {Object|null} props.nextGrade - 下一等级对象
 * @param {Function} props.onPress - 点击回调
 */
const GradeCard = ({ grade, expendMoney, nextGrade, onPress }) => {
  const { t } = useTranslation();
  const discount = grade?.equity?.discount || 10;
  const isMaxLevel = !nextGrade;
  const nextRequirement = nextGrade?.upgrade?.expend_money || 0;
  
  return (
    <div 
      className="grade-card bg-white rounded-xl shadow-sm p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onPress}
    >
      {/* Header: Badge and Discount */}
      <div className="grade-card__header flex items-center justify-between">
        <GradeBadge grade={grade} size="lg" />
        {discount < 10 && (
          <span className="grade-card__discount text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            {t('grade.discount_label', { rate: discount })}
          </span>
        )}
      </div>
      
      {/* Progress */}
      <GradeProgress
        currentExpend={expendMoney}
        nextLevelRequirement={nextRequirement}
        isMaxLevel={isMaxLevel}
      />
    </div>
  );
};

export default GradeCard;
