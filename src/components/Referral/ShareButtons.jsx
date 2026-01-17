import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 分享按钮组件
 */
const ShareButtons = ({ onShare }) => {
  const { t } = useTranslation();

  const shareOptions = [
    {
      key: 'line',
      label: t('referral.share_line', 'แชร์ไปยัง LINE'),
      icon: '💬',
      color: 'bg-green-500'
    },
    {
      key: 'copy',
      label: t('referral.copy_link', 'คัดลอกลิงก์'),
      icon: '📋',
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-4">
      <h3 className="font-bold mb-3">{t('referral.share_title', 'แชร์ให้เพื่อน')}</h3>
      <div className="grid grid-cols-2 gap-3">
        {shareOptions.map(option => (
          <button
            key={option.key}
            onClick={() => onShare(option.key)}
            className={`${option.color} text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
          >
            <span className="text-xl">{option.icon}</span>
            <span className="text-sm font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShareButtons;
