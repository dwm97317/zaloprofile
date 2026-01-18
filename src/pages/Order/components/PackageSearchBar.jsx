import React from 'react';
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { FilterIcon, RefreshIcon } from "../../../components/Icons";
import SearchWithHistory from "../../../components/Order/SearchWithHistory";

const PackageSearchBar = ({
    searchText,
    onSearchChange,
    onSearchSubmit,
    searchHistory,
    onRemoveHistory,
    onClearHistory,
    onFilterClick,
    hasActiveFilters,
    onRefresh,
    loading
}) => {
    const { t } = useTranslation();

    return (
        <div className="px-4 py-3 bg-white border-b border-slate-100 sticky top-[52px] z-10 shadow-sm">
            <div className="flex gap-3 items-center">
                <div className="flex-1 shadow-sm rounded-xl transition-shadow hover:shadow-md">
                    <SearchWithHistory
                        value={searchText}
                        onChange={onSearchChange}
                        onSearch={onSearchSubmit}
                        history={searchHistory}
                        onRemoveHistory={onRemoveHistory}
                        onClearHistory={onClearHistory}
                        placeholder={t("package.search_placeholder")}
                        className="w-full"
                    />
                </div>

                <button
                    onClick={onFilterClick}
                    className={classNames(
                        "p-3 rounded-xl transition-all duration-200 flex-shrink-0 active:scale-95 relative shadow-sm border",
                        hasActiveFilters
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-indigo-100'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    )}
                    title={t("filter.title", "ตัวกรอง")}
                >
                    <FilterIcon className="w-5 h-5" />
                    {hasActiveFilters && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        </span>
                    )}
                </button>

                <button
                    onClick={onRefresh}
                    className="p-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all duration-200 flex-shrink-0 active:scale-95 shadow-sm"
                    title={t("common.refresh", "รีเฟรช")}
                >
                    <RefreshIcon className={classNames("w-5 h-5", { "animate-spin": loading })} />
                </button>
            </div>
        </div>
    );
};

export default PackageSearchBar;
