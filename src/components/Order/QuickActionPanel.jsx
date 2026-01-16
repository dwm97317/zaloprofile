import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * QuickActionPanel Component
 * 
 * Bottom sheet modal that provides quick access to common order actions.
 * Triggered by long-press on order cards.
 */
const QuickActionPanel = ({ order, isOpen, onClose }) => {
  const { t } = useTranslation();

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      // Provide haptic feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      alert(t('common.copied', `${label} คัดลอกแล้ว`));
      onClose();
    } catch (err) {
      console.error('Failed to copy:', err);
      alert(t('common.copy_failed', 'คัดลอกไม่สำเร็จ'));
    }
  };

  const actions = [
    {
      id: 'copy-tracking',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      label: t('quick_action.copy_tracking', 'คัดลอกเลขพัสดุ'),
      color: 'text-blue-600 bg-blue-50',
      action: () => copyToClipboard(order.express_num, t('package.labels.tracking_no')),
    },
    {
      id: 'copy-order',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: t('quick_action.copy_order', 'คัดลอกเลขออเดอร์'),
      color: 'text-purple-600 bg-purple-50',
      action: () => copyToClipboard(order.order_sn, t('package.labels.order_no')),
    },
    {
      id: 'view-logistics',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      label: t('quick_action.view_logistics', 'ดูข้อมูลขนส่ง'),
      color: 'text-green-600 bg-green-50',
      action: () => {
        onClose();
        // Navigate to logistics page
        window.location.href = `/query?express_num=${order.express_num}`;
      },
    },
    {
      id: 'view-details',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      label: t('quick_action.view_details', 'ดูรายละเอียด'),
      color: 'text-orange-600 bg-orange-50',
      action: () => {
        onClose();
        // Navigate to detail page
        window.location.href = `/package/pack/detail?id=${order.id}`;
      },
    },
    {
      id: 'share',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      label: t('quick_action.share', 'แชร์'),
      color: 'text-pink-600 bg-pink-50',
      action: async () => {
        const shareData = {
          title: t('package.labels.tracking_no'),
          text: `${t('package.labels.tracking_no')}: ${order.express_num}`,
        };
        
        if (navigator.share) {
          try {
            await navigator.share(shareData);
            onClose();
          } catch (err) {
            if (err.name !== 'AbortError') {
              console.error('Share failed:', err);
            }
          }
        } else {
          // Fallback to copy
          copyToClipboard(order.express_num, t('package.labels.tracking_no'));
        }
      },
    },
    {
      id: 'add-note',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      label: t('quick_action.add_note', 'เพิ่มหมายเหตุ'),
      color: 'text-gray-600 bg-gray-50',
      action: () => {
        onClose();
        // Open note dialog (to be implemented)
        alert(t('common.coming_soon', 'เร็วๆ นี้'));
      },
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

      {/* Bottom sheet */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl animate-slide-up pb-safe">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {t('quick_action.title', 'การดำเนินการด่วน')}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {order.express_num}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Actions grid */}
        <div className="p-6 grid grid-cols-3 gap-4">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${action.color}`}>
                {action.icon}
              </div>
              <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* Cancel button */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            {t('common.cancel', 'ยกเลิก')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionPanel;
