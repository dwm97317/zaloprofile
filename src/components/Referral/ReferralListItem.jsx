import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 推荐记录项组件
 */
const ReferralListItem = ({ data, onClick }) => {
  const { t } = useTranslation();

  const statusColors = {
    1: 'text-orange-600 bg-orange-50',
    2: 'text-green-600 bg-green-50',
    3: 'text-gray-600 bg-gray-50'
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="bg-white rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* 用户信息 */}
      <div className="flex items-center mb-3">
        <img
          src={data.referee_info?.avatar || '/default-avatar.png'}
          alt=""
          className="w-12 h-12 rounded-full"
        />
        <div className="ml-3 flex-1">
          <div className="font-medium">{data.referee_info?.nickname || t('referral.anonymous', 'ผู้ใช้')}</div>
          <div className="text-xs text-gray-500">
            {formatTime(data.create_time)}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs ${statusColors[data.status]}`}>
          {data.status_text}
        </span>
      </div>

      {/* 任务进度 */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-600">{t('referral.your_task', 'งานของคุณ')}</div>
          <div className="text-sm font-medium">
            {data.referrer_task_status ? '✓ ' + t('referral.completed', 'เสร็จสิ้น') : t('referral.pending', 'รอดำเนินการ')}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-600">{t('referral.friend_task', 'งานของเพื่อน')}</div>
          <div className="text-sm font-medium">
            {data.referee_task_status ? '✓ ' + t('referral.completed', 'เสร็จสิ้น') : t('referral.pending', 'รอดำเนินการ')}
          </div>
        </div>
      </div>

      {/* 奖励信息 */}
      {data.rewards && data.rewards.length > 0 && (
        <div className="border-t pt-3">
          <div className="text-xs text-gray-600 mb-2">{t('referral.rewards_received', 'รางวัลที่ได้รับ')}</div>
          <div className="flex flex-wrap gap-2">
            {data.rewards.map((reward, index) => (
              <div key={index} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm">
                {reward.reward_type_text} {reward.reward_amount}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralListItem;
