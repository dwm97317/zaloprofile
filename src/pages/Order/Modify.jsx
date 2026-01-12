import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRecoilState, useRecoilValue } from "recoil";
import { packageInfoState, countryState, categoryState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import Button from "../../components/Button/Index";
import Loading from "../../components/Loading/Index";

const ModifyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Global State
  const [packInfo, setPackInfo] = useRecoilState(packageInfoState);
  const [country, setCountry] = useRecoilState(countryState);
  const [category, setCategory] = useRecoilState(categoryState);

  // Local State
  const [loading, setLoading] = useState(false);
  const [storageList, setStorageList] = useState([]);

  // Form Fields
  const [countryId, setCountryId] = useState("");
  const [countryName, setCountryName] = useState("");
  const [storageId, setStorageId] = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const [classIds, setClassIds] = useState("");
  const [className, setClassName] = useState("");
  const [price, setPrice] = useState("");
  const [remark, setRemark] = useState("");

  useEffect(() => {
    util.setBarPageView("Modify Package");
    fetchStorageList();

    // Initialize from packInfo
    if (packInfo) {
      setCountryId(packInfo.country_id || "");
      setCountryName(packInfo.country?.title || "");
      setStorageId(packInfo.storage_id || "");
      setTrackingNo(packInfo.express_num || "");
      setClassName(packInfo.class_name || "");
      setPrice(packInfo.price || "");
      setRemark(packInfo.usermark || "");

      // Note: retrieving 'class_ids' from packInfo might require checking if it exists as array or string
      // Assuming we might not have raw IDs if viewing detail, so user might need to re-select if they want to change it.
      // But if we just want to display, className is used. 
      // If API needs class_ids, and we don't have them in packInfo, modifying category implies re-selection.
    }

    // Override with Selected Country if returning from selection
    if (country) {
      setCountryId(country.id);
      setCountryName(country.title);
      // Don't clear country state here immediately as we might navigate back? 
      // Actually usually we clear it or just let it overwrite.
    }

    // Override with Selected Category if returning from selection
    if (category && category.length > 0) {
      const names = category.map(c => c.name).join(",");
      const ids = category.map(c => c.category_id).join(",");
      setClassName(names);
      setClassIds(ids);
    }

  }, [packInfo, country, category]);

  const fetchStorageList = async () => {
    try {
      const res = await request.get("package/storage&wxapp_id=10001");
      if (res.data) {
        setStorageList(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCountry = () => {
    navigate("/common/select/country");
  };

  const handleSelectCategory = () => {
    navigate("/common/select/category");
  };

  const handleSubmit = async () => {
    if (!countryId) {
      alert(t("package.error.required")); // "Please fill complete info" - generic or specific
      return;
    }
    if (!storageId) {
      alert(t("package.error.required"));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: packInfo.id,
        express_id: 10577, // Hardcoded in original
        express_sn: trackingNo,
        country_id: countryId,
        storage_id: storageId,
        class_ids: classIds || packInfo.class_ids, // Use new selection or fallback (if available)
        price: price,
        remark: remark
      };

      // If class_ids is empty and user didn't change it, we might be sending empty string if packInfo didn't have it.
      // However, assuming user just updates what they see.

      const res = await request.post("package/packageUpdate&wxapp_id=10001", payload);
      if (res.code === 1) {
        alert(t("package.success.update"));
        navigate(-1);
      } else {
        alert(res.msg || t("common.error"));
      }
    } catch (err) {
      console.error(err);
      alert(t("common.error_network"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">{t("package.modify_title")}</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Country */}
        <div className="bg-white rounded-xl p-4 shadow-sm" onClick={handleSelectCountry}>
          <label className="text-sm font-bold text-gray-700 block mb-2">{t("package.form.country")}</label>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <span className={countryName ? "text-gray-800" : "text-gray-400"}>
              {countryName || t("package.form.select_country")}
            </span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Warehouse */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="text-sm font-bold text-gray-700 block mb-2">{t("package.form.warehouse")}</label>
          <div className="relative">
            <select
              className="w-full p-3 bg-gray-50 rounded-lg appearance-none text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={storageId}
              onChange={(e) => setStorageId(e.target.value)}
            >
              <option value="">{t("package.form.select_warehouse")}</option>
              {storageList.map(s => (
                <option key={s.shop_id} value={s.shop_id}>{s.shop_name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tracking No */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="text-sm font-bold text-gray-700 block mb-2">{t("package.form.tracking_no")}</label>
          <input
            type="text"
            className="w-full p-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder={t("package.form.enter_tracking")}
            value={trackingNo}
            onChange={(e) => setTrackingNo(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="bg-white rounded-xl p-4 shadow-sm" onClick={handleSelectCategory}>
          <label className="text-sm font-bold text-gray-700 block mb-2">{t("package.form.category")}</label>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <span className={className ? "text-gray-800" : "text-gray-400"}>
              {className || t("package.form.select_category")}
            </span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Value */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="text-sm font-bold text-gray-700 block mb-2">{t("package.form.value")}(￥)</label>
          <input
            type="number"
            className="w-full p-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder={t("package.form.enter_value")}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {/* Remark */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="text-sm font-bold text-gray-700 block mb-2">{t("package.form.remark")}</label>
          <textarea
            className="w-full p-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 min-h-[100px]"
            placeholder={t("package.form.remark")}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="pt-4 pb-8">
          <Button onClick={handleSubmit} className="w-full rounded-xl py-3 text-lg font-bold shadow-blue-200">
            {t("package.form.save")}
          </Button>
        </div>
      </div>

      <Loading is={loading} />
    </div>
  );
};

export default ModifyPage;