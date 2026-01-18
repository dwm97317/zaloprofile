import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { categoryState } from "../../state";
import request from "../../utils/request";
import { ChevronRightIcon, CheckIcon } from "../../components/Icons";

const CategoryPage = () => {
  const { t } = useTranslation();
  const setCategoryData = useSetRecoilState(categoryState);
  const navigate = useNavigate();
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCategoryList = async () => {
    try {
      const res = await request.get("/package/category&wxapp_id=10001");
      if (res.data) {
        setCategory(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  const setSelect = (item, index, pindex) => {
    item["is_select"] = !item["is_select"];
    category[pindex]["child"][index] = item;
    setCategory([...category]);
  };

  const handleReset = () => {
    const resetCategory = category.map(parent => ({
      ...parent,
      child: parent.child.map(child => ({ ...child, is_select: false }))
    }));
    setCategory(resetCategory);
  };

  const handleConfirm = () => {
    let categorySelect = [];
    for (let i in category) {
      for (let ii in category[i]["child"]) {
        if (category[i]["child"][ii]["is_select"]) {
          categorySelect.push(category[i]["child"][ii]);
        }
      }
    }
    setCategoryData(categorySelect);
    navigate(-1);
  };

  useEffect(() => {
    getCategoryList();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans text-slate-900">
      {/* Header - Glassmorphism */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm sticky top-0 z-20 flex items-center justify-center transition-all">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-90"
        >
          <ChevronRightIcon className="w-6 h-6 rotate-180" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">{t("category.title", "Select Category")}</h1>
      </div>

      <div className="p-4 space-y-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 text-sm font-medium">{t("common.loading", "Loading...")}</p>
          </div>
        ) : category.length > 0 ? (
          category.map((item, pindex) => (
            <div key={pindex} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 transition-shadow hover:shadow-md">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-3 after:content-[''] after:h-px after:flex-1 after:bg-slate-100">
                {item["name"]}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {item["child"].map((item1, index) => (
                  <button
                    key={index}
                    onClick={() => setSelect(item1, index, pindex)}
                    className={classNames(
                      "relative px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 border text-center flex items-center justify-center gap-2 group",
                      item1["is_select"]
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm shadow-indigo-100"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    {item1["name"]}
                    {item1["is_select"] && (
                      <CheckIcon className="w-4 h-4 text-indigo-600 absolute right-2 opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-slate-400 mt-20">
            {t("common.no_data", "No data available")}
          </div>
        )}
      </div>

      {/* Fixed Bottom Buttons - Glassmorphism */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 pb-safe flex gap-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleReset}
          className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors active:scale-95"
        >
          {t("category.reset", "Reset")}
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 hover:scale-[1.02]"
        >
          {t("category.confirm", "Confirm")}
        </button>
      </div>
    </div>
  );
};

export default CategoryPage;
