import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getReferralCode } from '../../api/referral';
import ReferralCodeCard from '../../components/Referral/ReferralCodeCard';
import ShareButtons from '../../components/Referral/ShareButtons';
import StatisticsPanel from '../../components/Referral/StatisticsPanel';
import Loading from '../../components/Loading/Index';

/**
 * 邀请好友页面
 */
const InvitePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [codeData, setCodeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralCode();
  }, []);

  const loadReferralCode = async () => {
    try {
      const res = await getReferralCode();
      if (res.code === 200) {
        setCodeData(res.data);
      }
    } catch (error) {
      console.error('加载推荐码失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform) => {
    if (!codeData) return;

    if (platform === 'line') {
      // LINE 分享
      const text = t('referral.share_text', 'มาใช้บริการกับฉันสิ! ใช้รหัสแนะนำของฉัน: {{code}}', { code: codeData.referral_code });
      const url = `https://line.me/R/msg/text/?${encodeURIComponent(text + ' ' + codeData.share_url)}`;
      window.open(url, '_blank');
    } else if (platform === 'copy') {
      handleCopy();
    }
  };

  const handleCopy = () => {
    if (!codeData) return;
    
    navigator.clipboard.writeText(codeData.share_url).then(() => {
      alert(t('referral.copy_success', 'คัดลอกลิงก์สำเร็จ'));
    }).catch(() => {
      alert(t('referral.copy_failed', 'คัดลอกลิงก์ล้มเหลว'));
    });
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 pt-12 pb-8 px-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white text-2xl hover:scale-110 transition-transform"
          >
            ←
          </button>
          <h1 className="text-white text-xl font-bold flex-1">
            {t('referral.invite_friends', 'เชิญเพื่อน')}
          </h1>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* 推荐码卡片 */}
        {codeData && (
          <ReferralCodeCard 
            code={codeData.referral_code}
            shareUrl={codeData.share_url}
            qrCodeUrl={codeData.qr_code_url}
            onCopy={handleCopy}
          />
        )}

        {/* 分享按钮 */}
        <ShareButtons onShare={handleShare} />

        {/* 统计面板 */}
        {codeData && (
          <StatisticsPanel statistics={codeData.statistics} />
        )}

        {/* 快捷入口 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/referral/list')}
            className="bg-white rounded-2xl p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-2">📋</div>
            <div className="font-medium">{t('referral.my_referrals', 'รายการแนะนำ')}</div>
          </button>
          <button
            onClick={() => navigate('/referral/leaderboard')}
            className="bg-white rounded-2xl p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-2">🏆</div>
            <div className="font-medium">{t('referral.leaderboard', 'อันดับ')}</div>
          </button>
        </div>

        {/* 奖励规则说明 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold mb-3">{t('referral.reward_rules', 'กฎรางวัล')}</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>{t('referral.rule1', 'เชิญเพื่อนลงทะเบียนและทำรายการแรก ทั้งสองฝ่ายจะได้รับรางวัล')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>{t('referral.rule2', 'รางวัลจะถูกส่งอัตโนมัติหลังจากเพื่อนทำงานเสร็จสิ้น')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>{t('referral.rule3', 'รองรับการแนะนำหลายระดับ ยิ่งเชิญมากยิ่งได้รางวัลมาก')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
