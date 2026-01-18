import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { queryFormState, countryState, categoryState } from "../../state";
import Tab from "../../components/Tab/Tab";
import util from "../../utils/util";
import {
  GlobeIcon,
  ScaleIcon,
  BoxIcon,
  TagIcon,
  CalculatorIcon,
  ChevronRightIcon
} from "../../components/Icons";

const FreightPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Global State
  const country = useRecoilValue(countryState);
  const category = useRecoilValue(categoryState);
  const setCountryData = useSetRecoilState(countryState);
  const setCategoryData = useSetRecoilState(categoryState);
  const setFormQueryData = useSetRecoilState(queryFormState);
  const formQuery = useRecoilValue(queryFormState);

  // Local State
  const [form, setForm] = useState({
    freeType: 1, // 1: Weight, 2: Volume
    weight: "",
    length: "",
    width: "",
    height: "",
    country_id: "",
    class_ids: ""
  });
  const [displayData, setDisplayData] = useState({
    countryName: "",
    className: "",
    unitName: ""
  });

  // Init form from global state if returning from selection
  useEffect(() => {
    util.setBarPageView("Freight");

    // Restore from global state
    if (formQuery) {
      setForm(prev => ({
        ...prev,
        freeType: formQuery.freeType || 1,
        weight: formQuery.weight || "",
        length: formQuery.length || "",
        width: formQuery.width || "",
        height: formQuery.height || "",
        country_id: formQuery.country_id || "",
        class_ids: formQuery.class_ids || ""
      }));
      setDisplayData(prev => ({
        ...prev,
        countryName: formQuery.country || "",
        className: formQuery.class || "",
        unitName: formQuery.unitName || (formQuery.freeType == 2 ? t("freight.options.volume") : t("freight.options.weight"))
      }));
    }

    // Handle selections returning
    if (country) {
      setForm(prev => ({ ...prev, country_id: country.id }));
      setDisplayData(prev => ({ ...prev, countryName: country.title }));
      setCountryData(null); // Clear selection state
    }

    if (category && category.length > 0) {
      const names = category.map(c => c.name).join(", ");
      const ids = category.map(c => c.category_id).join(",");

      setForm(prev => ({ ...prev, class_ids: ids }));
      setDisplayData(prev => ({ ...prev, className: names }));
      setCategoryData(null); // Clear selection state
    }
  }, [country, category, t]);

  // Update global state on field change/blur
  const updateGlobalState = (newForm, newDisplay) => {
    setFormQueryData({
      ...newForm,
      country: newDisplay.countryName,
      class: newDisplay.className,
      unitName: newDisplay.unitName
    });
  };

  const handleInput = (field, value) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    updateGlobalState(updatedForm, displayData);
  };

  const handleUnitChange = (e) => {
    const val = parseInt(e.target.value);
    const name = val === 1 ? t("freight.options.weight") : t("freight.options.volume");

    const updatedForm = { ...form, freeType: val };
    const updatedDisplay = { ...displayData, unitName: name };

    setForm(updatedForm);
    setDisplayData(updatedDisplay);
    updateGlobalState(updatedForm, updatedDisplay);
  };

  const handleSubmit = () => {
    if (!form.country_id) {
      alert(t("freight.placeholder.region"));
      return;
    }
    navigate("/freight/result");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      {/* Header - Glassmorphism */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm sticky top-0 z-20 transition-all duration-200 flex items-center justify-center">
        <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <CalculatorIcon className="w-5 h-5 text-indigo-600" />
          {t("freight.title")}
        </h1>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-5">
        {/* Tips */}
        <div className="bg-indigo-50/80 border border-indigo-100 p-4 rounded-2xl flex gap-3 text-sm text-indigo-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="leading-relaxed opacity-90 relative z-10">
            {t("freight.tips")}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 p-6 space-y-6 border border-slate-100">

          {/* Region Selection */}
          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              {t("freight.section.region")}
            </label>
            <div
              onClick={() => navigate("/common/select/country")}
              className="relative bg-slate-50 hover:bg-slate-100 active:bg-slate-200 p-4 rounded-xl flex justify-between items-center cursor-pointer transition-colors border border-slate-200 hover:border-indigo-300 group-hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-indigo-500">
                  <GlobeIcon className="w-5 h-5" />
                </div>
                <span className={classNames("font-medium transition-colors", displayData.countryName ? "text-slate-800" : "text-slate-400")}>
                  {displayData.countryName || t("freight.placeholder.region")}
                </span>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-slate-300" />
            </div>
          </div>

          {/* Unit Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              {t("freight.section.unit")}
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-indigo-500 pointer-events-none z-10">
                <ScaleIcon className="w-5 h-5" />
              </div>
              <select
                value={form.freeType}
                onChange={handleUnitChange}
                className="w-full appearance-none bg-slate-50 hover:bg-slate-100 p-4 pl-16 rounded-xl text-slate-800 font-medium border border-slate-200 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
              >
                <option value={1}>{t("freight.options.weight")}</option>
                <option value={2}>{t("freight.options.volume")}</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </span>
            </div>
          </div>

          {/* Weight & Volume Inputs */}
          <div className="pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              {/* Weight Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  {t("freight.section.weight")}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => handleInput("weight", e.target.value)}
                    placeholder={t("freight.placeholder.weight")}
                    className="w-full bg-white p-3 pl-4 rounded-xl text-slate-800 font-medium placeholder-slate-300 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all focus:outline-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                    KG
                  </div>
                </div>
              </div>

              {/* Dimensions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                    {t("freight.section.dimensions")}
                  </label>
                  <span className="text-xs text-indigo-500 flex items-center gap-1">
                    <BoxIcon className="w-3 h-3" />
                    CM
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {['length', 'width', 'height'].map((dim) => (
                    <div key={dim} className="relative">
                      <input
                        type="number"
                        value={form[dim]}
                        onChange={(e) => handleInput(dim, e.target.value)}
                        placeholder={t(`freight.placeholder.${dim}`)}
                        className="w-full bg-white p-3 rounded-xl text-center text-slate-800 font-medium placeholder-slate-300 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all focus:outline-none"
                      />
                      <span className="absolute -bottom-5 w-full text-center text-[10px] text-slate-400 capitalize">{dim}</span>
                    </div>
                  ))}
                </div>
                {/* Add height spacer for labels below inputs */}
                <div className="h-4"></div>
              </div>
            </div>
          </div>

          {/* Goods Type Selector */}
          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              {t("freight.section.goods_type")}
            </label>
            <div
              onClick={() => navigate("/common/select/category")}
              className="relative bg-slate-50 hover:bg-slate-100 active:bg-slate-200 p-4 rounded-xl flex justify-between items-center cursor-pointer transition-colors border border-slate-200 hover:border-indigo-300 group-hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-indigo-500">
                  <TagIcon className="w-5 h-5" />
                </div>
                <span className={classNames("font-medium transition-colors", displayData.className ? "text-slate-800" : "text-slate-400")}>
                  {displayData.className || t("freight.placeholder.goods_type")}
                </span>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-slate-300" />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSubmit}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-lg shadow-indigo-300 hover:shadow-indigo-400 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <CalculatorIcon className="w-6 h-6" />
              {t("freight.calculate")}
            </button>
          </div>

        </div>
      </div>

      <Tab current="freight" />
    </div>
  );
};

export default FreightPage;