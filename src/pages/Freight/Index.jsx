import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { queryFormState, countryState, categoryState } from "../../state";
import Tab from "../../components/Tab/Tab";
import Button from "../../components/Button/Index";
import util from "../../utils/util";

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
    unitName: "" // Will be set on init or change
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
  }, [country, category, t]); // Added t to dependecy if language changes

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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm text-center font-bold text-lg text-gray-800">
        {t("freight.title")}
      </div>

      <div className="p-4 space-y-4">
        {/* Tips */}
        <div className="bg-orange-50 text-orange-600 p-3 rounded-lg text-xs leading-relaxed border border-orange-100">
          {t("freight.tips")}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-6">

          {/* Country Selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" className="w-5 h-5" />
              {t("freight.section.region")}
            </label>
            <div
              onClick={() => navigate("/common/select/country")}
              className="bg-gray-50 p-4 rounded-xl flex justify-between items-center cursor-pointer active:bg-gray-100 transition"
            >
              <span className={displayData.countryName ? "text-gray-800" : "text-gray-400"}>
                {displayData.countryName || t("freight.placeholder.region")}
              </span>
              <span className="text-gray-300">&rsaquo;</span>
            </div>
          </div>

          {/* Unit Selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img26.png" className="w-5 h-5" />
              {t("freight.section.unit")}
            </label>
            <div className="relative">
              <select
                value={form.freeType}
                onChange={handleUnitChange}
                className="w-full appearance-none bg-gray-50 p-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>{t("freight.options.weight")}</option>
                <option value={2}>{t("freight.options.volume")}</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">&darr;</span>
            </div>
          </div>

          {/* Weight/Volume Inputs */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            {/* Weight */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img40.png" className="w-5 h-5" />
                {t("freight.section.weight")}
              </label>
              <input
                type="number"
                value={form.weight}
                onChange={(e) => handleInput("weight", e.target.value)}
                placeholder={t("freight.placeholder.weight")}
                className="w-full bg-gray-50 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Dimensions (Always show or conditional?) - Showing always as per original logic somewhat implied */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img41.png" className="w-5 h-5" />
                {t("freight.section.dimensions")}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  value={form.length}
                  onChange={(e) => handleInput("length", e.target.value)}
                  placeholder={t("freight.placeholder.length")}
                  className="bg-gray-50 p-3 rounded-xl text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={form.width}
                  onChange={(e) => handleInput("width", e.target.value)}
                  placeholder={t("freight.placeholder.width")}
                  className="bg-gray-50 p-3 rounded-xl text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => handleInput("height", e.target.value)}
                  placeholder={t("freight.placeholder.height")}
                  className="bg-gray-50 p-3 rounded-xl text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Goods Type Selector */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img28.png" className="w-5 h-5" />
              {t("freight.section.goods_type")}
            </label>
            <div
              onClick={() => navigate("/common/select/category")}
              className="bg-gray-50 p-4 rounded-xl flex justify-between items-center cursor-pointer active:bg-gray-100 transition"
            >
              <span className={displayData.className ? "text-gray-800" : "text-gray-400"}>
                {displayData.className || t("freight.placeholder.goods_type")}
              </span>
              <span className="text-gray-300">&rsaquo;</span>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              className="w-full text-lg h-12 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-transform"
            >
              {t("freight.calculate")}
            </Button>
          </div>

        </div>
      </div>

      <Tab current="freight" />
    </div>
  );
};

export default FreightPage;