import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import request from '../../utils/request';
import util from '../../utils/util';
import CategorySelector from '../../components/PackageTake/CategorySelector';
import PackageCard from '../../components/PackageTake/PackageCard';
import Loading from '../../components/Loading/Index';

/**
 * Package Take Page - Redesigned
 * One-click claiming with modern UI/UX
 */
const PackageTake = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Quick Claim State
  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

  // Debug: Log category selection changes
  useEffect(() => {
    console.log('📦 Selected categories changed:', selectedCategories);
  }, [selectedCategories]);

  // Browse State
  const [availablePackages, setAvailablePackages] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    util.setBarPageView('Package Take');
    util.checkLogin(fetchAvailablePackages).then((isLogged) => {
      if (!isLogged) setTimeout(() => navigate('/mine'), 1000);
    });
  }, []);

  // Fetch available packages for claiming
  const fetchAvailablePackages = async (keyword = '') => {
    setPackagesLoading(true);
    try {
      const params = keyword ? { keyword } : {};
      const res = await request.get('package/packageForTaker&wxapp_id=10001', params);
      if (res.code === 1 && res.data?.data) {
        setAvailablePackages(res.data.data);
      } else {
        setAvailablePackages([]);
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      setAvailablePackages([]);
    } finally {
      setPackagesLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    fetchAvailablePackages(searchKeyword);
  };

  // Validate quick claim form
  const validateQuickClaim = () => {
    if (!trackingNumber.trim()) {
      toast.error(t('packageTake.error.emptyTracking', 'กรุณากรอกหมายเลขพัสดุ'));
      return false;
    }

    if (trackingNumber.trim().length < 6) {
      toast.error(t('packageTake.error.invalidTracking', 'หมายเลขพัสดุไม่ถูกต้อง'));
      return false;
    }

    if (selectedCategories.length === 0) {
      toast.error(t('packageTake.error.noCategories', 'กรุณาเลือกประเภทสินค้า'));
      return false;
    }

    return true;
  };

  // Handle quick claim submission
  const handleQuickClaim = async () => {
    if (!validateQuickClaim()) return;

    setClaimLoading(true);
    try {
      const classIds = selectedCategories.map(c => c.category_id).join(',');
      const res = await request.post('package/getTakePackage&wxapp_id=10001', {
        express_sn: trackingNumber.trim(),
        class_ids: classIds
      });

      if (res.code === 1) {
        // Success animation
        toast.success(t('packageTake.success', 'รับพัสดุสำเร็จ! 🎉'), {
          duration: 3000,
          icon: '✅'
        });

        // Reset form
        setTrackingNumber('');
        setSelectedCategories([]);
        setShowCategorySelector(false);

        // Redirect after delay
        setTimeout(() => {
          navigate('/order/package', { state: { claimedPackage: true } });
        }, 2000);
      } else {
        toast.error(res.msg || t('packageTake.error.failed', 'รับพัสดุล้มเหลว'));
      }
    } catch (error) {
      console.error('Claim error:', error);
      toast.error(t('packageTake.error.network', 'เกิดข้อผิดพลาด กรุณาลองใหม่'));
    } finally {
      setClaimLoading(false);
    }
  };

  // Handle claim from browse list
  const handleClaimFromList = (pkg) => {
    // Extract full tracking number (unmask if needed)
    const fullTrackingNumber = pkg.express_num || pkg.express_sn || '';
    setTrackingNumber(fullTrackingNumber);
    setSelectedPackage(pkg);
    setShowCategorySelector(true);
    
    // Scroll to quick claim section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 px-4 pt-6 pb-12 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-white/90 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">
                {t('packageTake.title', 'รับพัสดุ')}
              </h1>
              <p className="text-base text-white/90 mt-1">
                {t('packageTake.subtitle', 'รับพัสดุของคุณได้ง่ายๆ ภายใน 30 วินาที')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-6 space-y-6 pb-6">
        {/* Quick Claim Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-blue-100 relative overflow-hidden">
          {/* Badge */}
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
              {t('packageTake.quickClaim', 'รับด่วน')}
            </span>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            {t('packageTake.oneClickClaim', 'รับพัสดุด่วน 1 คลิก')}
          </h2>

          {/* Tracking Number Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('packageTake.trackingNumber', 'หมายเลขพัสดุ')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder={t('packageTake.enterTracking', 'กรอกหมายเลขพัสดุ')}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                disabled={claimLoading}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {t('packageTake.trackingHint', 'หมายเลขพัสดุประกอบด้วย 6-20 ตัวอักษร')}
            </p>
          </div>

          {/* Category Selection Button */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('packageTake.itemCategory', 'ประเภทสินค้า')} <span className="text-red-500">*</span>
            </label>
            <button
              onClick={() => setShowCategorySelector(!showCategorySelector)}
              disabled={claimLoading}
              className="w-full flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {selectedCategories.length > 0
                      ? `${t('packageTake.selected', 'เลือกแล้ว')} ${selectedCategories.length} ${t('packageTake.items', 'รายการ')}`
                      : t('packageTake.selectCategory', 'เลือกประเภทสินค้า')
                    }
                  </div>
                  {selectedCategories.length > 0 && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {selectedCategories.map(c => c.name).join(', ')}
                    </div>
                  )}
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${showCategorySelector ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Category Selector (Expandable) */}
          {showCategorySelector && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 animate-slide-in-bottom">
              <CategorySelector
                selectedCategories={selectedCategories}
                onSelect={setSelectedCategories}
              />
            </div>
          )}

          {/* Claim Button */}
          <button
            onClick={handleQuickClaim}
            disabled={claimLoading || !trackingNumber.trim() || selectedCategories.length === 0}
            className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200
              ${claimLoading || !trackingNumber.trim() || selectedCategories.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-xl hover:scale-[1.02] active:scale-95'
              }
            `}
          >
            {claimLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{t('packageTake.claiming', 'กำลังรับพัสดุ...')}</span>
              </div>
            ) : (
              <>
                <span>{t('packageTake.claimNow', 'รับพัสดุเลย')}</span>
                <span className="ml-2">🚀</span>
              </>
            )}
          </button>
        </div>

        {/* OR Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-sm font-bold text-gray-400 uppercase">
            {t('common.or', 'หรือ')}
          </span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Browse Available Packages */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {t('packageTake.browsePackages', 'เรียกดูพัสดุที่พร้อมรับ')}
          </h2>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('packageTake.searchPlaceholder', 'ค้นหาด้วยหมายเลขพัสดุ')}
                className="w-full pl-10 pr-20 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-500 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t('common.search', 'ค้นหา')}
              </button>
            </div>
          </div>

          {/* Package List */}
          <div className="space-y-3">
            {packagesLoading ? (
              <div className="py-10">
                <Loading is={true} />
              </div>
            ) : availablePackages.length > 0 ? (
              availablePackages.map((pkg, index) => (
                <PackageCard
                  key={pkg.id || index}
                  package={pkg}
                  onClaim={handleClaimFromList}
                  loading={claimLoading}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-400 font-medium">
                  {t('packageTake.noPackages', 'ไม่มีพัสดุที่พร้อมรับ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-blue-900 mb-2">
                {t('packageTake.howTo', 'วิธีรับพัสดุ')}
              </h3>
              <ol className="space-y-1.5 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-500">1.</span>
                  <span>{t('packageTake.step1', 'กรอกหมายเลขพัสดุที่ได้รับจากผู้ส่ง')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-500">2.</span>
                  <span>{t('packageTake.step2', 'เลือกประเภทสินค้าในพัสดุ')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-500">3.</span>
                  <span>{t('packageTake.step3', 'กดปุ่ม "รับพัสดุเลย" เพื่อยืนยัน')}</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageTake;
