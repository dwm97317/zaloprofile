import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { lineIdState, queryFormState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import Loading from "../../components/Loading/Index";

const FreightResultPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setLineId = useSetRecoilState(lineIdState);
  const setFormQueryData = useSetRecoilState(queryFormState);
  const formQuery = useRecoilValue(queryFormState);

  const [list, setList] = useState([]);
  const [allList, setAllList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    util.setBarPageView("Estimated Freight");
    if (formQuery) {
      fetchEstimatedFreight();
      fetchAllRoutes();
    } else {
      // If no form data, maybe redirect back or just fetch all
      fetchAllRoutes();
    }

    // Cleanup form data on unmount or after fetch? 
    // Original code cleared it immediately but that might prevent re-fetch if component updates. 
    // Let's clear it on unmount or just leave it. 
    // Original: setFormQueryData("");

    return () => {
      // cleanup
    }
  }, []);

  const fetchEstimatedFreight = async () => {
    if (!formQuery) return;
    setLoading(true);
    try {
      const res = await request.post("page/getfree&wxapp_id=10001", formQuery);
      if (Array.isArray(res.data)) {
        setList(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRoutes = async () => {
    try {
      const countryId = formQuery?.country_id || ""; // Fallback if needed
      const res = await request.get("page/getAllline&wxapp_id=10001", { country_id: countryId });
      if (Array.isArray(res.data)) {
        setAllList(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDetail = (lineId) => {
    if (lineId) {
      setLineId(lineId);
      navigate("/common/line/detail");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">{t("freight.result.title")}</h1>
      </div>

      {/* Tips */}
      <div className="bg-orange-50 p-4 flex gap-3 items-start mx-4 mt-4 rounded-xl border border-orange-100">
        <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img34.png" className="w-5 h-5 flex-shrink-0 mt-0.5 object-contain" />
        <p className="text-sm text-orange-700 leading-relaxed font-medium">
          {t("freight.result.note")}
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Calculated Results */}
        {list.length > 0 && (
          <div className="space-y-4">
            {list.map((item, index) => (
              <ResultCard
                key={`est-${index}`}
                item={item}
                onClick={() => handleDetail(item.id)}
                t={t}
              />
            ))}
          </div>
        )}

        {list.length === 0 && !loading && formQuery && (
          <div className="text-center py-4 text-gray-400 text-sm">
            {t("common.no_data")}
          </div>
        )}

        {/* All Routes Label */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
          <div className="bg-blue-100 p-1.5 rounded-lg">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img14.png" className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-gray-800 text-lg">{t("freight.result.all_routes")}</h2>
        </div>

        {/* All Routes List */}
        <div className="space-y-4">
          {allList.map((item, index) => (
            <ResultCard
              key={`all-${index}`}
              item={item}
              onClick={() => handleDetail(item.id)}
              t={t}
            />
          ))}
          {allList.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              {t("common.loading")}
            </div>
          )}
        </div>
      </div>

      <Loading is={loading} />
    </div>
  );
};

const ResultCard = ({ item, onClick, t }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.99] transition-transform cursor-pointer flex gap-4"
  >
    <img
      src={item.image || "https://zhuanyun.sllowly.cn/attachment/no_pic.png"}
      className="w-20 h-20 rounded-xl object-cover bg-gray-50 flex-shrink-0"
    />
    <div className="flex-1 min-w-0 flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
          {item.name}
        </h3>
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded ml-0">
            {t("freight.result.delivery_time")}: {item.limitationofdelivery}
          </span>
        </div>
      </div>
      <div className="mt-2 flex justify-between items-end">
        <div className="text-xs text-gray-500">
          {t("freight.result.tariff")}: <span className="text-orange-500 font-bold">{item.tariff}</span>
        </div>
        <span className="text-xs text-blue-600 font-medium">
          {t("freight.result.click_detail")} &rarr;
        </span>
      </div>
    </div>
  </div>
);

export default FreightResultPage;