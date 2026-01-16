import React from 'react';
import { useTranslation } from 'react-i18next';
import { getGradeStyle } from '../../utils/gradeUtils';

/**
 * GradeBadge Component
 * 等级徽章组件 - 使用勋章形式显示等级
 * 
 * @param {Object} props
 * @param {Object|null} props.grade - 等级对象
 * @param {string} props.size - 尺寸 ('sm' | 'md' | 'lg')
 * @param {boolean} props.showName - 是否显示等级名称
 * @param {Function} props.onClick - 点击回调
 */
const GradeBadge = ({ grade, size = 'md', showName = true, onClick }) => {
  const { t } = useTranslation();
  const style = getGradeStyle(grade?.weight || 0);
  const gradeName = grade?.name || t('grade.default_name');
  
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-8 h-10',
      icon: 'text-base',
      text: 'text-[8px]',
      nameText: 'text-xs'
    },
    md: {
      container: 'w-10 h-12',
      icon: 'text-lg',
      text: 'text-[9px]',
      nameText: 'text-sm'
    },
    lg: {
      container: 'w-14 h-16',
      icon: 'text-2xl',
      text: 'text-[10px]',
      nameText: 'text-base'
    }
  };
  
  const config = sizeConfig[size];
  
  return (
    <div 
      className={`grade-badge grade-badge--${style.level} inline-flex items-center gap-2 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* 勋章容器 */}
      <div className={`grade-badge__medal relative ${config.container} flex-shrink-0`}>
        {/* 勋章背景 - 六边形 */}
        <div 
          className="absolute inset-0 grade-badge__hexagon"
          style={{
            background: `linear-gradient(135deg, ${style.color}15 0%, ${style.color}30 100%)`,
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
          }}
        />
        
        {/* 勋章边框 */}
        <div 
          className="absolute inset-0 grade-badge__border"
          style={{
            background: `linear-gradient(135deg, ${style.color} 0%, ${style.color}CC 100%)`,
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
            padding: '2px'
          }}
        >
          <div 
            className="w-full h-full"
            style={{
              background: 'white',
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
            }}
          />
        </div>
        
        {/* 勋章图标 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <span className={`${config.icon} grade-badge__icon-emoji`} style={{ color: style.color }}>
            {style.icon}
          </span>
          <span 
            className={`${config.text} font-bold mt-0.5 grade-badge__level-text`}
            style={{ color: style.color }}
          >
            {grade?.weight >= 30 ? 'VIP' : grade?.weight >= 20 ? 'PRO' : grade?.weight >= 10 ? 'PLUS' : 'NEW'}
          </span>
        </div>
        
        {/* 光晕效果 */}
        <div 
          className="absolute inset-0 grade-badge__glow opacity-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle, ${style.color}40 0%, transparent 70%)`,
            filter: 'blur(8px)'
          }}
        />
      </div>
      
      {/* 等级名称 */}
      {showName && (
        <span 
          className={`grade-badge__name ${config.nameText} font-medium whitespace-nowrap`}
          style={{ color: style.color }}
        >
          {gradeName}
        </span>
      )}
    </div>
  );
};

export default GradeBadge;
