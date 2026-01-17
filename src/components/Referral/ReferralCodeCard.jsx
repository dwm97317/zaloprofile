import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

/**
 * 推荐码卡片组件
 */
const ReferralCodeCard = ({ code, shareUrl, qrCodeUrl, onCopy }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold mb-2">
          {t('referral.my_code', 'รหัสแนะนำของฉัน')}
        </h2>
        <div className="text-3xl font-bold tracking-wider">{code}</div>
      </div>

      {/* 二维码 */}
      <div className="bg-white p-4 rounded-xl mx-auto w-fit">
        <QRCodeSVG value={shareUrl} size={150} />
      </div>

      {/* 复制按钮 */}
      <button
        onClick={onCopy}
        className="w-full mt-4 bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors"
      >
        {t('referral.copy_link', 'คัดลอกลิงก์แนะนำ')}
      </button>
    </div>
  );
};

export default ReferralCodeCard;
