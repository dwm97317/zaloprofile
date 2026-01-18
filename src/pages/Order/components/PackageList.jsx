import React from 'react';
import { useTranslation } from "react-i18next";
import VirtualizedOrderList from "../../../components/Order/VirtualizedOrderList";
import EnhancedOrderCard from "../../../components/Order/EnhancedOrderCard";
import OrderCardSkeleton from "../../../components/Order/OrderCardSkeleton";
import ErrorState from "../../../components/Common/ErrorState";
import PullToRefresh from "../../../components/Common/PullToRefresh";
import EmptyState from "../../../components/Common/EmptyState";

const PackageList = ({
    loading,
    list,
    error,
    filteredOrders, // This is the processed list used for display
    onRetry,
    onRefresh,
    selectionMode,
    selectedPackages,
    onToggleSelection,
    onDetail,
    onEdit,
    onLogistics,
    onConfirmCancel,
    onImageClick,
    onLongPress,
    pagination,
    onLoadMore,
    hasActiveFilters,
    onResetFilters
}) => {
    const { t } = useTranslation();

    if (loading && list.length === 0) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => <OrderCardSkeleton key={i} />)}
            </div>
        );
    }

    if (error) {
        return (
            <ErrorState
                message={error}
                onRetry={onRetry}
            />
        );
    }

    if (filteredOrders.length > 0) {
        return (
            <>
                <PullToRefresh onRefresh={onRefresh}>
                    <div style={{ height: 'calc(100vh - 380px)', minHeight: '400px' }}>
                        <VirtualizedOrderList
                            items={filteredOrders}
                            estimateSize={280}
                            overscan={3}
                            renderItem={(item, index) => (
                                <div key={item.id} className="mb-5 px-1">
                                    <EnhancedOrderCard
                                        item={item}
                                        index={index}
                                        selectionMode={selectionMode}
                                        isSelected={selectedPackages.includes(item.id)}
                                        onToggleSelection={onToggleSelection}
                                        onDetail={onDetail}
                                        onEdit={onEdit}
                                        onLogistics={onLogistics}
                                        onConfirmCancel={onConfirmCancel}
                                        onImageClick={onImageClick}
                                        onLongPress={onLongPress}
                                    />
                                </div>
                            )}
                            onLoadMore={onLoadMore}
                            hasMore={pagination.hasMore}
                            loading={loading}
                        />
                    </div>
                </PullToRefresh>

                {/* Load More Button */}
                {!loading && pagination.hasMore && (
                    <button
                        onClick={onLoadMore}
                        className="w-full py-3.5 bg-white border border-slate-200 text-slate-500 font-medium rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                    >
                        {t("common.load_more", "โหลดเพิ่มเติม")} ({pagination.currentPage} / {Math.ceil(pagination.total / pagination.pageSize)})
                    </button>
                )}

                {/* Pagination Info */}
                <div className="text-center py-4">
                    <div className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-400 font-medium">
                        {hasActiveFilters && (
                            <span className="text-indigo-500 mr-1">
                                {t("filter.showing_filtered", "Filter")}: {filteredOrders.length} /
                            </span>
                        )}
                        {t("common.showing", "Total")} {pagination.total} {t("common.items", "items")}
                    </div>
                </div>
            </>
        );
    }

    if (list.length > 0 && filteredOrders.length === 0) {
        return (
            <div className="py-10">
                <EmptyState
                    icon={
                        <svg className="w-24 h-24 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    }
                    title={t("filter.no_results", "No results found")}
                    description={t("filter.no_results_desc", "Try adjusting your filters")}
                    actionLabel={t("filter.clear_filters", "Clear Filters")}
                    onAction={onResetFilters}
                />
            </div>
        );
    }

    return (
        <div className="py-20">
            <EmptyState
                icon={
                    <svg className="w-24 h-24 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                }
                title={t("common.no_data", "No Data")}
                description={t("package.no_orders", "No packages in this status")}
            />
        </div>
    );
};

export default PackageList;
