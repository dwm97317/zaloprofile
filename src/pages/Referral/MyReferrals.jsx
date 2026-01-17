import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getReferralList } from '../../api/referral';
import ReferralListItem from '../../components/Referral/ReferralListItem';
import Loading from '../../components/Loading/Index';

/**
 * 我的推荐页面
 */
const MyReferralsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadList(true);
  }, [activeTab]);

  const loadList = async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page;
      const res = await getReferralList({ 
        status: activeTab,
        page: currentPage,
        limit: 20
      });
      
      if (res.code === 200) {
        if (reset) {
          setList(res.data.list);
          setPage(1);
        } else {
          setList([...list, ...res.data.list]);
        }
        setHasMore(res.data.list.length >= 20);
      }
    } catch (error) {
      console.error('加载推荐列表失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(page + 1);
      loadList(false);
    }
  };

  const tabs = [
    { key: 'all', label: t('referral.all', 'ทั้งหมด') },
    { key: 'pending', label: t('referral.pending', 'รอดำเนินการ') },
    { key: 'completed', label: t('referral.completed', 'เสร็จสิ้น') },
    { key: 'expired', label: t('referral.expired', 'หมดอายุ') }
  ];

  if (loading && list.length === 0) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 text-2xl hover:scale-110 transition-transform"
          >
            ←
          </button>
          <h1 className="text-lg font-bold flex-1">
            {t('referral.my_referrals', 'รายการแนะนำของฉัน')}
          </h1>
        </div>

        {/* Tab 切换 */}
        <div className="flex border-b">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 推荐列表 */}
      <div className="p-4 space-y-3">
        {list.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <div className="text-gray-500">{t('referral.no_data', 'ยังไม่มีข้อมูล')}</div>
          </div>
        ) : (
          <>
            {list.map(item => (
              <ReferralListItem 
                key={item.id} 
                data={item}
                onClick={() => navigate(`/referral/detail?id=${item.id}`)}
              />
            ))}
            
            {/* 加载更多 */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                className="w-full py-3 text-blue-600 text-sm"
                disabled={loading}
              >
                {loading ? t('common.loading', 'กำลังโหลด...') : t('common.load_more', 'โหลดเพิ่มเติม')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyReferralsPage;
