import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { packageInfoState, expressSnState, packageIdsState, selectionModeState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import Loading from "../../components/Loading/Index";
import { toast } from "../../utils/toast";
import Tab from "../../components/Tab/Tab";
import VirtualizedOrderList from "../../components/Order/VirtualizedOrderList";
import OrderCard from "../../components/Order/OrderCard";
import EnhancedOrderCard from "../../components/Order/EnhancedOrderCard";
import EnhancedTabBar from "../../components/Order/EnhancedTabBar";
import FloatingActionBar from "../../components/Order/FloatingActionBar";
import OrderCardSkeleton from "../../components/Order/OrderCardSkeleton";
import OptimizedImage from "../../components/Common/OptimizedImage";
import EmptyState from "../../components/Common/EmptyState";
import ErrorState from "../../components/Common/ErrorState";
import PullToRefresh from "../../components/Common/PullToRefresh";
import LocalStatisticsPanel from "../../components/Order/LocalStatisticsPanel";
import CompactStatisticsWidget from "../../components/Order/CompactStatisticsWidget";
import SearchWithHistory from "../../components/Order/SearchWithHistory";
import { useOrderFilter } from "../../hooks/useOrderFilter";
import { useLocalStatistics } from "../../hooks/useLocalStatistics";
import { useSearchHistory } from "../../hooks/useSearchHistory";
import { useToast } from "../../hooks/useToast";
import { performanceMonitor } from "../../utils/performanceMonitor";
import "./Index.scss";

// Lazy load heavy components
const FilterPanel = lazy(() => import("../../components/Order/FilterPanel"));
const QuickActionPanel = lazy(() => import("../../components/Order/QuickActionPanel"));

const OrderPackagePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setPackage = useSetRecoilState(packageInfoState);
  const setExpress = useSetRecoilState(expressSnState);
  const setPackageIds = useSetRecoilState(packageIdsState);
  const selectionMode = useRecoilValue(selectionModeState);
  const setSelectionMode = useSetRecoilState(selectionModeState);

  const [list, setList] = useState([]);
  const [tab, setTab] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState({
    nocount: 0,
    yescount: 0,
    yessend: 0,
    procount: 0,
    outboundcount: 0, // 已出库数量（待支付+已支付）
    completedcount: 0, // 已完成数量（已收货）
  });
  const [searchText, setSearchText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [imageModal, setImageModal] = useState({ show: false, images: [], currentIndex: 0 });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [quickActionOrder, setQuickActionOrder] = useState(null);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  
  // Use hooks
  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();
  const toastManager = useToast();
  
  // Use filter hook - must be before useLocalStatistics
  const {
    filteredOrders,
    filters,
    updateFilters,
    resetFilters,
    availableWarehouses,
    availableCountries,
    availableStatuses,
    hasActiveFilters,
  } = useOrderFilter(list);
  
  // Use statistics hook - must be after filteredOrders is defined
  const statistics = useLocalStatistics(filteredOrders);
  
  // 分页状态
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    total: 0,
    hasMore: true
  });
  
  // 数据缓存
  const [cache, setCache] = useState({});
  const [countCache, setCountCache] = useState(null);
  const [countCacheTime, setCountCacheTime] = useState(0);
  
  // 搜索防抖
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);

  useEffect(() => {
    // Start performance monitoring
    performanceMonitor.start();
    
    util.checkLogin(fetchOrderList).then((res) => {
      if (res) {
        fetchToDoCount();
      } else {
        setTimeout(() => navigate("/mine"), 1000);
      }
    });
    util.setBarPageView("Package List");

    // Cleanup
    return () => {
      performanceMonitor.stop();
    };
  }, []);

  const fetchOrderList = async (params) => {
    // 生成缓存key
    const currentTab = params?.tab ?? tab;
    const keyword = params?.keyword ?? searchText;
    const page = params?.page ?? 1;
    const cacheKey = `${currentTab}_${keyword}_${page}`;
    
    // 检查缓存（非强制刷新时）
    if (!params?.forceRefresh && cache[cacheKey]) {
      setList(cache[cacheKey].data);
      setPagination(cache[cacheKey].pagination);
      setError(null);
      performanceMonitor.trackCacheHit();
      return;
    }
    
    setLoading(true);
    setError(null);
    performanceMonitor.trackAPICall();
    const url = "package/outside&wxapp_id=10001";
    let query = {
      status: currentTab,
      page: page,
      page_size: 20
    };
    if (keyword) query.keyword = keyword;

    try {
      const res = await request.get(url, query);
      if (res.data && Array.isArray(res.data.data)) {
        const newData = res.data.data;
        const newPagination = {
          currentPage: res.data.current_page || 1,
          pageSize: res.data.per_page || 20,
          total: res.data.total || 0,
          hasMore: (res.data.current_page || 1) < (res.data.last_page || 1)
        };
        
        setList(newData);
        setPagination(newPagination);
        
        // 缓存数据
        setCache(prev => ({ 
          ...prev, 
          [cacheKey]: { 
            data: newData, 
            pagination: newPagination 
          } 
        }));
      } else {
        setList([]);
        setPagination({ currentPage: 1, pageSize: 20, total: 0, hasMore: false });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load orders');
      setList([]);
      setPagination({ currentPage: 1, pageSize: 20, total: 0, hasMore: false });
      toastManager.error(t('common.error.load_failed', 'โหลดข้อมูลไม่สำเร็จ'));
    } finally {
      setLoading(false);
    }
  };

  const fetchToDoCount = async () => {
    // 检查缓存（5分钟内）
    const now = Date.now();
    if (countCache && (now - countCacheTime) < 5 * 60 * 1000) {
      setCount(countCache);
      return;
    }
    
    try {
      const res = await request.get("/package/countpack&wxapp_id=10001");
      setCount(res.data);
      // 缓存统计数据
      setCountCache(res.data);
      setCountCacheTime(now);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSelectionMode(false);
    setSelectedPackages([]);
    setPagination({ currentPage: 1, pageSize: 20, total: 0, hasMore: true });
    fetchOrderList({ tab: newTab, page: 1 });
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
  };

  const togglePackageSelection = (packageId, item) => {
    // Only allow selection for received packages (status 2)
    if (item.status !== 2) {
      return;
    }
    
    setSelectedPackages((prev) => {
      if (prev.includes(packageId)) {
        return prev.filter((id) => id !== packageId);
      } else {
        return [...prev, packageId];
      }
    });
  };

  const handleSelectAll = () => {
    // Only select packages with status 2 (received) from filtered orders
    const selectableIds = filteredOrders.filter(item => item.status === 2).map((item) => item.id);
    setSelectedPackages(selectableIds);
  };

  const handleDeselectAll = () => {
    setSelectedPackages([]);
  };

  const handleApplyPacking = () => {
    if (selectedPackages.length === 0) {
      toast.error(t("package.error.no_selection", "กรุณาเลือกพัสดุอย่างน้อย 1 รายการ"));
      return;
    }

    // Check if all selected packages are from the same warehouse
    const selectedItems = filteredOrders.filter(item => selectedPackages.includes(item.id));
    const storageIds = [...new Set(selectedItems.map(item => item.storage_id))];
    
    if (storageIds.length > 1) {
      toast.error(t("package.error.different_warehouse", "กรุณาเลือกพัสดุจากคลังเดียวกันเท่านั้น"));
      return;
    }

    console.log("Setting packageIds:", selectedPackages);
    setPackageIds(selectedPackages);
    console.log("Navigating to /packages/pack");
    navigate("/packages/pack");
  };

  const handleSearch = useCallback(() => {
    // Clear previous timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    
    // Set new timer (300ms debounce)
    const timer = setTimeout(() => {
      // Add to search history if not empty
      if (searchText.trim()) {
        addSearch(searchText.trim());
      }
      // Update filter keyword instead of fetching
      updateFilters({ keyword: searchText });
    }, 300);
    
    setSearchDebounceTimer(timer);
  }, [searchDebounceTimer, searchText, updateFilters, addSearch]);
  
  const handleRefresh = useCallback(() => {
    // 清除缓存并重新加载
    setCache({});
    setPagination({ currentPage: 1, pageSize: 20, total: 0, hasMore: true });
    fetchOrderList({ tab: tab, keyword: searchText, page: 1, forceRefresh: true });
    fetchToDoCount();
    toastManager.success(t('common.refreshed', 'รีเฟรชสำเร็จ'));
  }, [tab, searchText, toastManager, t]);

  const handlePullToRefresh = useCallback(async () => {
    // Pull-to-refresh handler
    await handleRefresh();
  }, [handleRefresh]);

  const handleLongPress = useCallback((order) => {
    if (!selectionMode) {
      setQuickActionOrder(order);
      setIsQuickActionOpen(true);
    }
  }, [selectionMode]);
  
  const handleLoadMore = useCallback(() => {
    if (!loading && pagination.hasMore) {
      const nextPage = pagination.currentPage + 1;
      fetchOrderList({ tab: tab, keyword: searchText, page: nextPage });
    }
  }, [loading, pagination, tab, searchText]);
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  const handleDetail = (item) => {
    setPackage(item);
    navigate("/package/pack/detail");
  };

  const handleEdit = (item) => {
    setPackage(item);
    navigate("/package/pack/modify");
  };

  const handleLogistics = (expressSn) => {
    setExpress(expressSn);
    navigate("/query");
  };

  const confirmCancel = (id) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const handleCancel = async () => {
    setShowConfirm(false);
    try {
      const res = await request.post("package/cancle&wxapp_id=10001", { id: selectedId });
      if (res.code === 1) {
        alert(t("package.success.cancel"));
        fetchOrderList();
        fetchToDoCount();
      } else {
        alert(res.msg);
      }
    } catch (err) {
      console.error(err);
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

  const tabs = [
    { id: 2, label: t("package.tabs.received"), countKey: "yescount" },
    { id: 56, label: t("package.tabs.outbound", "已出库"), countKey: "outboundcount" },
    { id: 9, label: t("package.tabs.shipped"), countKey: "yessend" },
    { id: 10, label: t("package.tabs.completed", "已完成"), countKey: "completedcount" },
    { id: 1, label: t("package.tabs.not_received"), countKey: "nocount" },
    { id: -1, label: t("package.tabs.issue"), countKey: "procount" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Floating Compact Statistics Widget */}
      {!loading && !error && filteredOrders.length > 0 && (
        <CompactStatisticsWidget statistics={statistics} />
      )}

      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">{t("package.title")}</h1>
      </div>

      <EnhancedTabBar 
        tabs={tabs}
        activeTab={tab}
        onTabChange={handleTabChange}
        counts={count}
      />

      <div className="p-4 bg-white border-b border-gray-100">
        <div className="flex gap-2">
          <SearchWithHistory
            value={searchText}
            onChange={(value) => {
              setSearchText(value);
              handleSearch();
            }}
            onSearch={(term) => {
              setSearchText(term);
              updateFilters({ keyword: term });
            }}
            history={history}
            onRemoveHistory={removeSearch}
            onClearHistory={clearHistory}
            placeholder={t("package.search_placeholder")}
          />
          <button
            onClick={() => setIsFilterPanelOpen(true)}
            className={`p-2.5 rounded-xl transition-colors relative ${
              hasActiveFilters 
                ? 'bg-primary-500 text-white' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
            title={t("filter.title", "ตัวกรอง")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          <button
            onClick={handleRefresh}
            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
            title={t("common.refresh", "รีเฟรช")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {tab === 2 && filteredOrders.length > 0 && !selectionMode && (
        <div className="px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3 border border-white/20">
            <div className="flex items-start gap-2 text-white text-sm">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium mb-1">{t("package.warehouse_notice.title", "ข้อควรทราบ")}</p>
                <p className="text-white/90 text-xs">{t("package.warehouse_notice.message", "สามารถเลือกพัสดุจากคลังเดียวกันเท่านั้นเพื่อสมัครแพ็คร่วมกัน")}</p>
              </div>
            </div>
          </div>
          <button
            onClick={toggleSelectionMode}
            className="w-full py-3 rounded-xl bg-white text-primary-600 font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>
              {`${t("package.apply_packing", "สมัครแพ็คพัสดุ")} (${filteredOrders.length})`}
            </span>
          </button>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Statistics Panel - Removed from here, now floating */}

        {loading && list.length === 0 ? (
          <div className="space-y-4">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
        ) : error ? (
          <ErrorState 
            message={error} 
            onRetry={() => fetchOrderList({ tab, keyword: searchText, page: 1, forceRefresh: true })} 
          />
        ) : filteredOrders.length > 0 ? (
          <>
            {/* Virtualized Order List */}
            <PullToRefresh onRefresh={handlePullToRefresh}>
              <div style={{ height: 'calc(100vh - 400px)', minHeight: '400px' }}>
                <VirtualizedOrderList
                  items={filteredOrders}
                  estimateSize={250}
                  overscan={3}
                  renderItem={(item, index) => (
                    <div key={item.id} className="mb-4">
                      <EnhancedOrderCard
                        item={item}
                        index={index}
                        selectionMode={selectionMode}
                        isSelected={selectedPackages.includes(item.id)}
                        onToggleSelection={togglePackageSelection}
                        onDetail={handleDetail}
                        onEdit={handleEdit}
                        onLogistics={handleLogistics}
                        onConfirmCancel={confirmCancel}
                        onImageClick={handleImageClick}
                        onLongPress={handleLongPress}
                      />
                    </div>
                  )}
                  onLoadMore={handleLoadMore}
                  hasMore={pagination.hasMore}
                  loading={loading}
                />
              </div>
            </PullToRefresh>
            
            {/* Load More Button */}
            {!loading && pagination.hasMore && filteredOrders.length > 0 && (
              <button
                onClick={handleLoadMore}
                className="w-full py-3 bg-white border-2 border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t("common.load_more", "โหลดเพิ่มเติม")} ({pagination.currentPage} / {Math.ceil(pagination.total / pagination.pageSize)})
              </button>
            )}
            
            {/* Pagination Info */}
            {filteredOrders.length > 0 && (
              <div className="text-center text-xs text-gray-400 py-2">
                {hasActiveFilters && (
                  <div className="mb-2 text-primary-600 font-medium">
                    {t("filter.showing_filtered", "แสดงผลลัพธ์ที่กรอง")}: {filteredOrders.length} / {list.length}
                  </div>
                )}
                {t("common.showing", "แสดง")} {filteredOrders.length} {t("common.of", "จาก")} {pagination.total} {t("common.items", "รายการ")}
              </div>
            )}
          </>
        ) : list.length > 0 && filteredOrders.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            }
            title={t("filter.no_results", "ไม่พบผลลัพธ์ที่ตรงกับตัวกรอง")}
            description={t("filter.no_results_desc", "ลองปรับเปลี่ยนตัวกรองหรือคำค้นหาของคุณ")}
            actionLabel={t("filter.clear_filters", "ล้างตัวกรอง")}
            onAction={resetFilters}
          />
        ) : (
          <EmptyState
            icon={
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            }
            title={t("common.no_data", "ไม่มีข้อมูล")}
            description={t("package.no_orders", "ยังไม่มีพัสดุในสถานะนี้")}
          />
        )}
      </div>

      <FloatingActionBar
        visible={selectionMode}
        selectedCount={selectedPackages.length}
        totalCount={filteredOrders.filter(item => item.status === 2).length}
        onApplyPacking={handleApplyPacking}
        onCancel={toggleSelectionMode}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        warehouseValidation={(() => {
          if (selectedPackages.length === 0) return null;
          
          const selectedItems = filteredOrders.filter(item => selectedPackages.includes(item.id));
          const storageIds = [...new Set(selectedItems.map(item => item.storage_id))];
          const warehouseNames = [...new Set(selectedItems.map(item => item.storage?.shop_name).filter(Boolean))];
          
          if (storageIds.length > 1) {
            return {
              valid: false,
              message: t("package.warehouse_notice.different_warehouse", "พัสดุที่เลือกมาจากคลังที่แตกต่างกัน กรุณาเลือกพัสดุจากคลังเดียวกัน")
            };
          } else if (warehouseNames.length > 0) {
            return {
              valid: true,
              warehouseName: warehouseNames[0]
            };
          }
          return null;
        })()}
      />

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t("common.confirm")}</h3>
            <p className="text-gray-600 mb-6">{t("package.confirm_cancel")}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200"
              >
                {t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Bottom Navigation */}
      <Tab />

      {/* Toast Container */}
      <toastManager.ToastContainer />

      {/* Filter Panel */}
      <Suspense fallback={<div className="fixed inset-0 bg-black/20 z-40" />}>
        <FilterPanel
          isOpen={isFilterPanelOpen}
          onClose={() => setIsFilterPanelOpen(false)}
          filters={filters}
          onApply={updateFilters}
          availableWarehouses={availableWarehouses}
          availableCountries={availableCountries}
          availableStatuses={availableStatuses}
        />
      </Suspense>

      {/* Quick Action Panel */}
      {quickActionOrder && (
        <Suspense fallback={null}>
          <QuickActionPanel
            order={quickActionOrder}
            isOpen={isQuickActionOpen}
            onClose={() => {
              setIsQuickActionOpen(false);
              setQuickActionOrder(null);
            }}
          />
        </Suspense>
      )}
    </div>
  );
};

export default OrderPackagePage;
