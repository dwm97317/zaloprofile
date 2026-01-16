import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * PackageCard Component
 * Display available package info with claim action
 */
const PackageCard = ({ package: pkg, onClaim, loading = false }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Package Info */}
        <div className="flex-1 space-y-2.5">
          {/* Tracking Number */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">
                {t('packageTake.trackingNumber', 'หมายเลขพัสดุ')}
              </div>
              <div className="text-sm font-bold text-gray-900 font-mono">
                {pkg.express_num || 'N/A'}
              </div>
            </div>
          </div>

          {/* Entry Time */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {t('packageTake.entryTime', 'เข้าคลัง')}: {pkg.entering_warehouse_time || 'N/A'}
            </span>
          </div>
        </div>

        {/* Claim Button */}
        <button
          onClick={() => onClaim(pkg)}
          disabled={loading}
          className={`
            px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all duration-200
            ${loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-md hover:scale-105 active:scale-95'
            }
          `}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{t('common.loading', 'กำลังโหลด...')}</span>
            </div>
          ) : (
            t('packageTake.claim', 'รับพัสดุ')
          )}
        </button>
      </div>
    </div>
  );
};

export default PackageCard;
