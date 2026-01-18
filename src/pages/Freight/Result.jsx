import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { lineIdState, queryFormState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import Loading from "../../components/Loading/Index";
import { ChevronRightIcon, InfoIcon, TruckIcon } from "../../components/Icons";

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
      fetchAllRoutes();
    }

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
    <div className="min-h-screen bg-slate-50 pb-safe font-sans">
      {/* Header - Glassmorphism */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm sticky top-0 z-20 flex items-center transition-all">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-90">
          <ChevronRightIcon className="w-6 h-6 rotate-180" />
        </button>
        <h1 className="text-lg font-bold ml-2 text-slate-800 tracking-tight">{t("freight.result.title")}</h1>
      </div>

      {/* Tips */}
      <div className="bg-indigo-50/80 border border-indigo-100 p-4 flex gap-3 items-start mx-4 mt-4 rounded-xl shadow-sm">
        <div className="w-5 h-5 flex-shrink-0 mt-0.5 text-indigo-500">
          <InfoIcon className="w-full h-full" />
        </div>
        <p className="text-sm text-indigo-700 leading-relaxed font-medium">
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
          <div className="text-center py-4 text-slate-400 text-sm">
            {t("common.no_data")}
          </div>
        )}

        {/* All Routes Label */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
          <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600">
            <TruckIcon className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-slate-800 text-lg">{t("freight.result.all_routes")}</h2>
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
            <div className="text-center py-10 text-slate-400">
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
    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.99] hover:shadow-md transition-all cursor-pointer flex gap-4 group"
  >
    <img
      src={item.image || "https://zhuanyun.sllowly.cn/attachment/no_pic.png"}
      className="w-20 h-20 rounded-xl object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
    />
    <div className="flex-1 min-w-0 flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-slate-800 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {item.name}
        </h3>
        <div className="flex flex-wrap gap-1">
          <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-xs font-medium border border-indigo-100">
            {t("freight.result.delivery_time")}: {item.limitationofdelivery}
          </span>
        </div>
      </div>
      <div className="mt-2 flex justify-between items-end">
        <div className="text-xs text-slate-500 font-medium">
          {t("freight.result.tariff")}: <span className="text-orange-500 font-bold ml-1 text-sm">{item.tariff}</span>
        </div>
        <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
          {t("freight.result.click_detail")} <ChevronRightIcon className="w-3 h-3" />
        </span>
      </div>
    </div>
  </div>
);

export default FreightResultPage;