import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LineButton from '../../components/LineButton/Index';
import LineInput from '../../components/LineInput/Index';
import { toast } from '../../utils/toast';
import { handleApiError } from '../../utils/errorHandler';
import request from '../../utils/request';
import './Claim.scss';

/**
 * 包裹认领页面 - LINE Theme
 * 用户可以通过包裹识别码认领包裹
 */
const PackageClaimPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [claimCode, setClaimCode] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * 表单验证
   */
  const validateForm = () => {
    if (!claimCode.trim()) {
      toast.error(t('claim.error.emptyCode', 'กรุณากรอกรหัสพัสดุ'));
      return false;
    }

    // 验证格式（可选）
    if (claimCode.trim().length < 6) {
      toast.error(t('claim.error.invalidCode', 'รหัสพัสดุไม่ถูกต้อง'));
      return false;
    }

    return true;
  };

  /**
   * 处理认领提交
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 调用认领 API
      const res = await request.post('package/claim&wxapp_id=10001', {
        claim_code: claimCode.trim(),
      });

      if (res.code === 1) {
        toast.success(t('claim.success', 'รับพัสดุสำเร็จ'));
        
        // 清空表单
        setClaimCode('');
        
        // 延迟跳转到订单列表
        setTimeout(() => {
          navigate('/order/index');
        }, 1500);
      } else {
        // 处理业务错误
        handleApiError({ response: { data: res } }, {
          defaultMessage: t('claim.error.failed', 'รับพัสดุล้มเหลว')
        });
      }
    } catch (error) {
      console.error('Claim error:', error);
      handleApiError(error, {
        defaultMessage: t('claim.error.network', 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="claim-page">
      {/* Header */}
      <div className="claim-header">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-6 left-4 z-20 w-10 h-10 flex items-center justify-center 
                   bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 装饰性背景 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2">
            {t('claim.title', 'รับพัสดุ')}
          </h1>
          <p className="text-base opacity-90">
            {t('claim.subtitle', 'กรอกรหัสพัสดุเพื่อรับพัสดุของคุณ')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="claim-content">
        {/* 说明卡片 */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-6 mb-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                {t('claim.info.title', 'วิธีรับพัสดุ')}
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">1.</span>
                  <span>{t('claim.info.step1', 'รับรหัสพัสดุจากผู้ส่ง')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  <span>{t('claim.info.step2', 'กรอกรหัสพัสดุในช่องด้านล่าง')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">3.</span>
                  <span>{t('claim.info.step3', 'กดปุ่มยืนยันเพื่อรับพัสดุ')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 认领表单 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 animate-slide-in-bottom">
          <div className="mb-6">
            <LineInput
              label={t('claim.form.code', 'รหัสพัสดุ')}
              required
              placeholder={t('claim.form.codePlaceholder', 'กรอกรหัสพัสดุ 6-20 ตัวอักษร')}
              value={claimCode}
              onChange={setClaimCode}
              type="text"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              {t('claim.form.codeHint', 'รหัสพัสดุประกอบด้วย 6-20 ตัวอักษรหรือตัวเลข')}
            </p>
          </div>

          <LineButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading || !claimCode.trim()}
          >
            {t('claim.form.submit', 'ยืนยันการรับพัสดุ')}
          </LineButton>
        </form>

        {/* 帮助链接 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/article/help/list')}
            className="text-primary-600 font-bold text-base hover:text-primary-700 
                     transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('claim.help', 'ต้องการความช่วยเหลือ?')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageClaimPage;
