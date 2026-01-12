import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRecoilValue } from "recoil";
import { expressSnState } from "../../state";
import Tab from "../../components/Tab/Tab"; // Footer
import Header from "../../components/Header/Header"; // Header
import request from "../../utils/request";
import util from "../../utils/util";
import Button from "../../components/Button/Index";
import Loading from "../../components/Loading/Index";

const QueryPage = () => {
  const { t } = useTranslation();
  const expressSn = useRecoilValue(expressSnState);

  const [trackingCode, setTrackingCode] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    util.setBarPageView("Query");
    if (expressSn) {
      setTrackingCode(expressSn);
      handleSearch(expressSn);
    }
  }, []); // Only runs once on mount

  const handleSearch = async (codeToSearch) => {
    const code = codeToSearch || trackingCode;

    if (!code) {
      alert(t("query.placeholder"));
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await request.post("/package/logicist&wxapp_id=10001", { code });
      // Assuming res.data.logic is the array
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
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-[70px]"> {/* Padding bottom for footer */}
      <Header title={t("query.title")} showBack={false} />

      {/* Search Section */}
      <div className="bg-blue-600 px-4 pt-4 pb-12 rounded-b-[2rem] shadow-lg">
        <div className="bg-white rounded-xl p-4 shadow-md mt-2">
          <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 block flex items-center gap-2">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img27.png" className="w-4 h-4" />
            {t("query.tracking_no")}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={t("query.placeholder")}
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Button onClick={() => handleSearch()} className="w-full rounded-lg shadow-blue-200 py-3 text-sm font-bold">
              {t("query.search")}
            </Button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="flex-1 px-4 -mt-6">
        <div className="bg-white rounded-xl shadow-sm min-h-[300px] p-6">
          <h3 className="font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">{t("query.result")}</h3>

          {list.length > 0 ? (
            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {list.map((item, index) => (
                <div key={index} className="relative flex items-start group">
                  <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 border-white shadow flex-shrink-0 z-10 ${index === 0 ? 'bg-blue-600 ring-4 ring-blue-50' : 'bg-gray-200'}`}>
                    {index === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <div className="ml-6 pb-8">
                    <p className={`text-sm ${index === 0 ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                      {item.logistics_describe}
                    </p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {item.created_time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p className="text-sm">{hasSearched ? t("query.no_data") : t("query.placeholder")}</p>
            </div>
          )}
        </div>
      </div>

      <Loading is={loading} />
      <Tab />
    </div>
  );
};

export default QueryPage;