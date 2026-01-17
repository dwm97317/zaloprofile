import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 统计面板组件
 */
const StatisticsPanel = ({ statistics }) => {
  const { t } = useTranslation();

  const stats = [
    {
      key: 'share_count',
      label: t('referral.share_count', 'จำนวนการแชร์'),
      value: statistics?.share_count || 0,
      icon: '📤',
      color: 'text-blue-600'
    },
    {
      key: 'register_count',
      label: t('referral.register_count', 'จำนวนการลงทะเบียน'),
      value: statistics?.register_count || 0,
      icon: '👥',
      color: 'text-green-600'
    },
    {
      key: 'success_count',
      label: t('referral.success_count', 'แนะนำสำเร็จ'),
      value: statistics?.success_count || 0,
      icon: '✅',
      color: 'text-purple-600'
    },
    {
      key: 'total_reward',
      label: t('referral.total_reward', 'รางวัลทั้งหมด'),
      value: `¥${(statistics?.total_reward || 0).toFixed(2)}`,
      icon: '💰',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-4">
      <h3 className="font-bold mb-3">{t('referral.my_statistics', 'สถิติของฉัน')}</h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(stat => (
          <div key={stat.key} className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{stat.icon}</span>
              <span className="text-xs text-gray-600">{stat.label}</span>
            </div>
            <div className={`text-xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsPanel;
