import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRecoilValue } from "recoil";
import classNames from "classnames";
import { expressSnState } from "../../state";
import Tab from "../../components/Tab/Tab";
import Header from "../../components/Header/Header";
import request from "../../utils/request";
import util from "../../utils/util";
import Loading from "../../components/Loading/Index";
import { SearchIcon, PackageIcon, EmptyStateIcon, TruckIcon } from "../../components/Icons";

const QueryPage = () => {
  const { t } = useTranslation();
  const expressSn = useRecoilValue(expressSnState);

  const [trackingCode, setTrackingCode] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (codeToSearch) => {
    const code = codeToSearch || trackingCode;

    if (!code) {
      // Use a toast or custom alert here normally, but keeping simple for now
      return;
    }

    setLoading(true);
    setHasSearched(true);
    // Smooth scroll to results
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const res = await request.post("/package/logicist&wxapp_id=10001", { code });
      if (res.data && res.data.logic) {
        setList(res.data.logic);
      } else {
        setList([]);
      }
    } catch (err) {
      console.error(err);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [trackingCode]);

  useEffect(() => {
    util.setBarPageView("Query");
    if (expressSn) {
      setTrackingCode(expressSn);
      handleSearch(expressSn);
    }
  }, [expressSn, handleSearch]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col pb-[90px]">
      <Header title={t("query.title")} showBack={false} className="bg-white shadow-sm z-50 relative" />

      {/* Hero / Search Section */}
      <div className="relative pt-6 px-4 pb-12 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-b-[40px] shadow-lg -z-10" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl -z-10" />

        <div className="max-w-xl mx-auto mt-2">
          <h2 className="text-white text-lg font-medium opacity-90 mb-6 text-center">
            {t("query.track_package_subtitle") || "Track your shipment"}
          </h2>

          <div className="bg-white rounded-2xl shadow-xl shadow-indigo-900/10 p-2 transform transition-all hover:scale-[1.01]">
            <div className="relative flex items-center">
              <div className="absolute left-4 text-indigo-500">
                <PackageIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-xl text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                placeholder={t("query.placeholder")}
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={() => handleSearch()}
                className="absolute right-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white p-2.5 rounded-lg transition-all shadow-md shadow-indigo-600/20"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className="text-center text-slate-100/70 text-xs mt-4">
            {t("query.enter_tracking_hint") || "Enter your tracking number above"}
          </p>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 px-4 max-w-xl mx-auto w-full -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[300px] overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TruckIcon className="w-5 h-5 text-indigo-600" />
              {t("query.result")}
            </h3>
            {hasSearched && list.length > 0 && (
              <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                In Transit
              </span>
            )}
          </div>

          <div className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 text-sm mt-4">Tracking your package...</p>
              </div>
            ) : list.length > 0 ? (
              <div className="py-6 px-4">
                <div className="space-y-0 relative pl-2">
                  {/* Vertical Line */}
                  <div className="absolute left-6 top-2 bottom-6 w-0.5 bg-slate-100"></div>

                  {list.map((item, index) => (
                    <div key={index} className="relative flex items-start group pb-8 last:pb-0">
                      {/* Timeline Dot */}
                      <div className={classNames(
                        "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-[3px] flex-shrink-0 transition-colors duration-300",
                        {
                          'bg-indigo-600 border-indigo-100 shadow-md shadow-indigo-200': index === 0,
                          'bg-white border-slate-200': index !== 0
                        }
                      )}>
                        {index === 0 && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        {index !== 0 && <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>}
                      </div>

                      {/* Content */}
                      <div className="ml-4 flex-1 pt-1">
                        <p className={classNames(
                          "text-sm leading-relaxed transition-colors duration-200",
                          {
                            'text-slate-800 font-semibold': index === 0,
                            'text-slate-500': index !== 0
                          }
                        )}>
                          {item.logistics_describe}
                        </p>
                        <time className="block text-xs font-medium text-slate-400 mt-1.5 bg-slate-50 inline-block px-2 py-0.5 rounded-md">
                          {item.created_time}
                        </time>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <EmptyStateIcon className="w-10 h-10 text-slate-300" />
                </div>
                <h4 className="text-slate-600 font-medium mb-1">
                  {hasSearched ? t("query.not_found") : t("query.ready_to_track")}
                </h4>
                <p className="text-xs text-slate-400 max-w-[200px] text-center">
                  {hasSearched
                    ? t("query.check_details_try_again")
                    : t("query.enter_code_description")}
                </p>
                {!hasSearched && (
                  <div className="mt-8 flex gap-2">
                    {/* Example chips if needed, omitted for now */}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Loading is={loading} />
      <Tab />
    </div>
  );
};

export default QueryPage;