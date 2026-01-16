import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { packageIdsState } from "../../state";
import request from "../../utils/request";
import { toast } from "../../utils/toast";
import Loading from "../../components/Loading/Index";
import LineButton from "../../components/LineButton/Index";
import OptimizedImage from "../../components/Common/OptimizedImage";
import "./PackagePackSelect.scss";

/**
 * 包裹选择页面 - 申请打包
 * 用户可以查看已入库的包裹，选择要打包的包裹
 */
const PackagePackSelectPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setPackageIds = useSetRecoilState(packageIdsState);

  const [packages, setPackages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageModal, setImageModal] = useState({ show: false, images: [], currentIndex: 0 });

  const fetchPackages = async () => {
    try {
      const res = await request.get("package/outside&wxapp_id=10001", { status: 2 });

      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        setPackages(res.data.data);
      } else {
        setPackages([]);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error(t("package.error.fetch_failed", "ไม่สามารถโหลดข้อมูลพัสดุได้"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPackages();
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === packages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(packages.map((pkg) => pkg.id));
    }
  };

  const handleNext = () => {
    if (selectedIds.length === 0) {
      toast.error(t("package.select_pack.error.no_selected", "กรุณาเลือกพัสดุอย่างน้อย 1 ชิ้น"));
      return;
    }

    // 检查是否所有选中的包裹都来自同一个仓库
    const selectedPackages = packages.filter(pkg => selectedIds.includes(pkg.id));
    const storageIds = [...new Set(selectedPackages.map(pkg => pkg.storage_id))];
    
    if (storageIds.length > 1) {
      toast.error(t("package.error.different_warehouse", "กรุณาเลือกพัสดุจากคลังเดียวกันเท่านั้น"));
      return;
    }

    setPackageIds(selectedIds);
    navigate("/packages/pack");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleImageClick = (images, index) => {
    setImageModal({ show: true, images, currentIndex: index });
  };

  const closeImageModal = () => {
    setImageModal({ show: false, images: [], currentIndex: 0 });
  };

  const nextImage = () => {
    setImageModal(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }));
  };

  const prevImage = () => {
    setImageModal(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading is={true} />
      </div>
    );
  }

  return (
    <div className="package-pack-select-page">
      {/* Header - LINE 主题 */}
      <div className="pack-select-header">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-4 z-20 w-10 h-10 flex items-center justify-center
                   bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* 装饰性背景 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2">
            {t("package.select_pack.title", "เลือกพัสดุเพื่อแพ็ค")}
          </h1>
          <p className="text-base opacity-90">
            {t("package.select_pack.subtitle", "เลือกพัสดุที่ต้องการแพ็คเข้าด้วยกัน")}
          </p>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="pack-select-content">
        {/* 统计和操作栏 */}
        <div className="stats-bar">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t("package.select_pack.available", "พัสดุที่เลือกได้")}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {packages.length} {t("package.select_pack.items", "ชิ้น")}
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
          
          {/* 仓库提示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">{t("package.warehouse_notice.title", "ข้อควรทราบ")}</p>
              <p>{t("package.warehouse_notice.message", "สามารถเลือกพัสดุจากคลังเดียวกันเท่านั้นเพื่อสมัครแพ็คร่วมกัน")}</p>
            </div>
          </div>
        </div>

        {/* 空状态 */}
        {packages.length === 0 ? (
          <div className="empty-state">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {t("package.select_pack.empty.title", "ไม่พบพัสดุที่สามารถแพ็คได้")}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {t(
                "package.select_pack.empty.description",
                "พัสดุของคุณยังไม่ได้รับเข้าคลังสินค้า"
              )}
            </p>
            <LineButton
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {t("common.refresh", "รีเฟรช")}
            </LineButton>
          </div>
        ) : (
          <>
            {/* 全选按钮 */}
            {packages.length > 1 && (
              <button
                onClick={toggleSelectAll}
                className="select-all-btn"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>
                  {selectedIds.length === packages.length
                    ? t("package.select_pack.deselect_all", "ยกเลิกทั้งหมด")
                    : t("package.select_pack.select_all", "เลือกทั้งหมด")}
                </span>
              </button>
            )}

            {/* 包裹列表 */}
            <div className="package-list">
              {packages.map((pkg, index) => {
                const isSelected = selectedIds.includes(pkg.id);
                
                return (
                <div
                  key={pkg.id}
                  className={`package-card ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleSelect(pkg.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* 选中状态指示器 */}
                  <div className="select-indicator">
                    {isSelected ? (
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                    )}
                  </div>

                  {/* 包裹信息 */}
                  <div className="package-info">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">
                            {pkg.express_num}
                          </h4>
                          {pkg.storage?.shop_name && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                              {pkg.storage.shop_name}
                            </span>
                          )}
                        </div>
                        {pkg.mark && (
                          <p className="text-xs text-primary-600 font-medium mb-1">
                            {t("package.labels.mark", "唛头")}: {pkg.mark}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">{pkg.class_name || t("package.labels.items")}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {pkg.weight && (
                          <div className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-bold">
                            {pkg.weight} kg
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 货物图片 */}
                    {pkg.images && pkg.images.length > 0 && (
                      <div className="mb-2">
                        <div className="flex gap-2 overflow-x-auto">
                          {pkg.images.map((img, idx) => (
                            <OptimizedImage
                              key={idx}
                              src={img} 
                              alt={`Package ${idx + 1}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageClick(pkg.images, idx);
                              }}
                              className="w-16 h-16 object-cover rounded-lg bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 text-xs text-gray-600">
                      {(pkg.length || pkg.width || pkg.height) && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                            />
                          </svg>
                          <span>
                            {t("package.labels.dimensions", "ขนาด")}: {pkg.length || '-'}×{pkg.width || '-'}×{pkg.height || '-'} cm
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          {t("package.select_pack.date", "วันที่")}:
                          {formatDate(pkg.create_time)}
                        </span>
                      </div>
                      {pkg.country?.title && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{pkg.country.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )})}
            </div>

            {/* 选中数量和提交按钮 */}
            {selectedIds.length > 0 && (
              <div className="submit-bar">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        {t("package.select_pack.selected", "เลือกแล้ว")}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedIds.length} / {packages.length} {t("package.select_pack.items", "ชิ้น")}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 仓库检查提示 */}
                {(() => {
                  const selectedPackages = packages.filter(pkg => selectedIds.includes(pkg.id));
                  const storageIds = [...new Set(selectedPackages.map(pkg => pkg.storage_id))];
                  const warehouseNames = [...new Set(selectedPackages.map(pkg => pkg.storage?.shop_name).filter(Boolean))];
                  
                  if (storageIds.length > 1) {
                    return (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-3">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="text-xs text-red-700">
                          <p className="font-medium">{t("package.warehouse_notice.error", "ไม่สามารถแพ็คร่วมกันได้")}</p>
                        </div>
                      </div>
                    );
                  } else if (warehouseNames.length > 0) {
                    return (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2 mb-3">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-xs text-green-700">
                          <p className="font-medium">{t("package.warehouse_notice.same_warehouse", "คลังเดียวกัน")}: {warehouseNames[0]}</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <LineButton
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleNext}
                >
                  {t("package.select_pack.next", "ถัดไป")}
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </LineButton>
              </div>
            )}
          </>
        )}
      </div>

      {imageModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={closeImageModal}>
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {imageModal.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <OptimizedImage
              src={imageModal.images[imageModal.currentIndex]}
              alt={`Package ${imageModal.currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            {imageModal.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                {imageModal.currentIndex + 1} / {imageModal.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagePackSelectPage;
