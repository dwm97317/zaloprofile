import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { packageInfoState, expressSnState, packageIdsState, selectionModeState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import { toast } from "../../utils/toast";
import Tab from "../../components/Tab/Tab";
import EnhancedTabBar from "../../components/Order/EnhancedTabBar";
import FloatingActionBar from "../../components/Order/FloatingActionBar";
import CompactStatisticsWidget from "../../components/Order/CompactStatisticsWidget";
import { useOrderFilter } from "../../hooks/useOrderFilter";
import { useLocalStatistics } from "../../hooks/useLocalStatistics";
import { useSearchHistory } from "../../hooks/useSearchHistory";
import { useToast } from "../../hooks/useToast";
import { performanceMonitor } from "../../utils/performanceMonitor";
import "./Index.scss";

// Sub-components
import PackageHeader from "./components/PackageHeader";
import PackageSearchBar from "./components/PackageSearchBar";
import WarehouseProNotice from "./components/WarehouseProNotice";
import PackageList from "./components/PackageList";
import ConfirmationModal from "./components/ConfirmationModal";
import ImageGalleryModal from "./components/ImageGalleryModal";

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
    outboundcount: 0,
    completedcount: 0,
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

  // Use statistics hook
  const statistics = useLocalStatistics(filteredOrders);

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    total: 0,
    hasMore: true
  });

  // Cache
  const [cache, setCache] = useState({});
  const [countCache, setCountCache] = useState(null);
  const [countCacheTime, setCountCacheTime] = useState(0);

  // Search Debounce
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);

  useEffect(() => {
    performanceMonitor.start();

    util.checkLogin(fetchOrderList).then((res) => {
      if (res) {
        fetchToDoCount();
      } else {
        setTimeout(() => navigate("/mine"), 1000);
      }
    });
    util.setBarPageView("Package List");

    return () => {
      performanceMonitor.stop();
    };
  }, []);

  const fetchOrderList = async (params) => {
    const currentTab = params?.tab ?? tab;
    const keyword = params?.keyword ?? searchText;
    const page = params?.page ?? 1;
    const cacheKey = `${currentTab}_${keyword}_${page}`;

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
    const now = Date.now();
    if (countCache && (now - countCacheTime) < 5 * 60 * 1000) {
      setCount(countCache);
      return;
    }

    try {
      const res = await request.get("/package/countpack&wxapp_id=10001");
      setCount(res.data);
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
    if (item.status !== 2) return;

    setSelectedPackages((prev) => {
      if (prev.includes(packageId)) {
        return prev.filter((id) => id !== packageId);
      } else {
        return [...prev, packageId];
      }
    });
  };

  const handleSelectAll = () => {
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

    const selectedItems = filteredOrders.filter(item => selectedPackages.includes(item.id));
    const storageIds = [...new Set(selectedItems.map(item => item.storage_id))];

    if (storageIds.length > 1) {
      toast.error(t("package.error.different_warehouse", "กรุณาเลือกพัสดุจากคลังเดียวกันเท่านั้น"));
      return;
    }

    setPackageIds(selectedPackages);
    navigate("/packages/pack");
  };

  const handleSearch = useCallback(() => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);

    const timer = setTimeout(() => {
      if (searchText.trim()) {
        addSearch(searchText.trim());
      }
      updateFilters({ keyword: searchText });
    }, 300);

    setSearchDebounceTimer(timer);
  }, [searchDebounceTimer, searchText, updateFilters, addSearch]);

  const handleRefresh = useCallback(() => {
    setCache({});
    setPagination({ currentPage: 1, pageSize: 20, total: 0, hasMore: true });
    fetchOrderList({ tab: tab, keyword: searchText, page: 1, forceRefresh: true });
    fetchToDoCount();
    toastManager.success(t('common.refreshed', 'รีเฟรชสำเร็จ'));
  }, [tab, searchText, toastManager, t]);

  const handlePullToRefresh = useCallback(async () => {
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

  useEffect(() => {
    return () => {
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
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

  const handleSearchChange = useCallback((value) => {
    setSearchText(value);
    handleSearch();
  }, [handleSearch]);

  const handleSearchSubmit = useCallback((term) => {
    setSearchText(term);
    updateFilters({ keyword: term });
  }, [updateFilters]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-safe">
      {/* Floating Compact Statistics Widget */}
      {!loading && !error && filteredOrders.length > 0 && (
        <div className="z-30 relative">
          <CompactStatisticsWidget statistics={statistics} />
        </div>
      )}

      <PackageHeader onBack={() => navigate(-1)} />

      {/* Tabs */}
      <div className="bg-white z-10 relative">
        <EnhancedTabBar
          tabs={tabs}
          activeTab={tab}
          onTabChange={handleTabChange}
          counts={count}
        />
      </div>

      <PackageSearchBar
        searchText={searchText}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        searchHistory={history}
        onRemoveHistory={removeSearch}
        onClearHistory={clearHistory}
        onFilterClick={() => setIsFilterPanelOpen(true)}
        hasActiveFilters={hasActiveFilters}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* Warehouse Selection Warning */}
      {tab === 2 && filteredOrders.length > 0 && !selectionMode && (
        <WarehouseProNotice
          filteredCount={filteredOrders.length}
          onToggleSelection={toggleSelectionMode}
        />
      )}

      {/* Main Content List */}
      <div className="p-4 space-y-5">
        <PackageList
          loading={loading}
          list={list}
          error={error}
          filteredOrders={filteredOrders}
          onRetry={() => fetchOrderList({ tab, keyword: searchText, page: 1, forceRefresh: true })}
          onRefresh={handlePullToRefresh}
          selectionMode={selectionMode}
          selectedPackages={selectedPackages}
          onToggleSelection={togglePackageSelection}
          onDetail={handleDetail}
          onEdit={handleEdit}
          onLogistics={handleLogistics}
          onConfirmCancel={confirmCancel}
          onImageClick={handleImageClick}
          onLongPress={handleLongPress}
          pagination={pagination}
          onLoadMore={handleLoadMore}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />
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
              message: t("package.warehouse_notice.different_warehouse", "Different warehouses selected")
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

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleCancel}
      />

      <ImageGalleryModal
        modalState={imageModal}
        onClose={closeImageModal}
        onNext={nextImage}
        onPrev={prevImage}
      />

      <Tab />
      <toastManager.ToastContainer />

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
