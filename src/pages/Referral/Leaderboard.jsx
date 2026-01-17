import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getReferralLeaderboard } from '../../api/referral';
import LeaderboardItem from '../../components/Referral/LeaderboardItem';
import Loading from '../../components/Loading/Index';

/**
 * 排行榜页面
 */
const LeaderboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const date = new Date();
      const dateStr = period === 'monthly' 
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : date.toISOString().split('T')[0];

      const res = await getReferralLeaderboard({ 
        period,
        date: dateStr
      });
      
      if (res.code === 200) {
        setData(res.data);
      }
    } catch (error) {
      console.error('加载排行榜失败', error);
    } finally {
      setLoading(false);
    }
  };

  const periods = [
    { key: 'daily', label: t('referral.daily', 'รายวัน') },
    { key: 'weekly', label: t('referral.weekly', 'รายสัปดาห์') },
    { key: 'monthly', label: t('referral.monthly', 'รายเดือน') }
  ];

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 pt-12 pb-8 px-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white text-2xl hover:scale-110 transition-transform"
          >
            ←
          </button>
          <h1 className="text-white text-xl font-bold flex-1">
            {t('referral.leaderboard', 'อันดับการแนะนำ')}
          </h1>
        </div>

        {/* 我的排名 */}
        {data && data.my_rank && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white/80 mb-1">
                  {t('referral.my_rank', 'อันดับของฉัน')}
                </div>
                <div className="text-3xl font-bold">#{data.my_rank}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/80 mb-1">
                  {t('referral.my_count', 'จำนวนของฉัน')}
                </div>
                <div className="text-2xl font-bold">{data.my_count}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Period Tabs */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex border-b">
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                period === p.key
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 排行榜列表 */}
      <div className="p-4 space-y-3">
        {data && data.list && data.list.length > 0 ? (
          data.list.map(item => (
            <LeaderboardItem 
              key={item.user_id} 
              data={item}
              isCurrentUser={item.user_id === data.current_user_id}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <div className="text-gray-500">{t('referral.no_data', 'ยังไม่มีข้อมูล')}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
