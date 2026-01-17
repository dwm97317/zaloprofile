import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 排行榜项组件
 */
const LeaderboardItem = ({ data, isCurrentUser }) => {
  const { t } = useTranslation();

  const getRankBadge = (rank) => {
    const badges = {
      1: { emoji: '🥇', color: 'text-yellow-500' },
      2: { emoji: '🥈', color: 'text-gray-400' },
      3: { emoji: '🥉', color: 'text-orange-400' }
    };
    return badges[rank] || { emoji: rank, color: 'text-gray-600' };
  };

  const badge = getRankBadge(data.rank);

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${
      isCurrentUser ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white'
    }`}>
      {/* 排名 */}
      <div className={`w-10 text-center font-bold text-lg ${badge.color}`}>
        {badge.emoji}
      </div>

      {/* 用户信息 */}
      <img
        src={data.user_info?.avatar || '/default-avatar.png'}
        alt=""
        className="w-12 h-12 rounded-full"
      />
      <div className="flex-1">
        <div className="font-medium">
          {data.user_info?.nickname || t('referral.anonymous', 'ผู้ใช้')}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-blue-600">({t('referral.you', 'คุณ')})</span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {t('referral.success_count', 'แนะนำสำเร็จ')}: {data.success_count}
        </div>
      </div>

      {/* 奖励 */}
      <div className="text-right">
        <div className="font-bold text-orange-600">
          ¥{(data.reward_amount || 0).toFixed(2)}
        </div>
        <div className="text-xs text-gray-500">
          {t('referral.reward', 'รางวัล')}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardItem;
