import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import request from "../../utils/request";
import util from "../../utils/util";
import Loading from "../../components/Loading/Index";
import Button from "../../components/Button/Index";

const PackReportPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("normal"); // 'normal' or 'batch'
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [storages, setStorages] = useState([]);

  // Form State
  const [country, setCountry] = useState(null); // { id, title }
  const [storageId, setStorageId] = useState("");
  const [storageName, setStorageName] = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const [batchTracking, setBatchTracking] = useState("");
  const [category, setCategory] = useState(null); // { id, name }
  const [goodsValue, setGoodsValue] = useState("");
  const [remark, setRemark] = useState("");
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);

  // Goods List (for single report)
  const [goodsList, setGoodsList] = useState([{ name: "", price: "", qty: "" }]);

  // Load Initial Data
  useEffect(() => {
    util.setBarPageView("Package Report");
    util.checkLogin().then(isLogged => {
      if (!isLogged) navigate("/mine");
    });
    fetchStorages();

    // Check if returning from selection pages
    const savedForm = sessionStorage.getItem("reportForm");
    if (savedForm) {
      const parsed = JSON.parse(savedForm);
      // Restore basic fields
      if (parsed.trackingNo) setTrackingNo(parsed.trackingNo);
      if (parsed.batchTracking) setBatchTracking(parsed.batchTracking);
      if (parsed.goodsValue) setGoodsValue(parsed.goodsValue);
      if (parsed.remark) setRemark(parsed.remark);
      if (parsed.storageId) {
        setStorageId(parsed.storageId);
        setStorageName(parsed.storageName);
      }
      if (parsed.goodsList) setGoodsList(parsed.goodsList);
      // Clear session unique usage
      sessionStorage.removeItem("reportForm");
    }

    // Check for selected Country
    const selectedCountry = sessionStorage.getItem("selectedCountry");
    if (selectedCountry) {
      setCountry(JSON.parse(selectedCountry));
      sessionStorage.removeItem("selectedCountry");
      saveFormState(); // Update form state with new country
    }

    // Check for selected Category
    const selectedCategory = sessionStorage.getItem("selectedCategory");
    if (selectedCategory) {
      setCategory(JSON.parse(selectedCategory));
      sessionStorage.removeItem("selectedCategory");
      saveFormState();
    }

  }, []);

  const saveFormState = () => {
    const formState = {
      trackingNo,
      batchTracking,
      goodsValue,
      remark,
      storageId,
      storageName,
      goodsList
    };
    sessionStorage.setItem("reportForm", JSON.stringify(formState));
  };

  const fetchStorages = async () => {
    try {
      const res = await request.get("/package/storage&wxapp_id=10001");
      if (res.data) {
        setStorages(res.data.map(s => ({ value: s.shop_id, label: s.shop_name })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCountrySelect = () => {
    saveFormState();
    navigate("/common/select/country");
  };

  const handleCategorySelect = () => {
    saveFormState();
    navigate("/common/select/category");
  };

  const handleStorageChange = (e) => {
    const selectedId = e.target.value;
    setStorageId(selectedId);
    const selected = storages.find(s => s.value == selectedId);
    if (selected) setStorageName(selected.label);
  };

  // Goods List Handlers
  const updatedGoodsItem = (idx, field, val) => {
    const newList = [...goodsList];
    newList[idx][field] = val;
    setGoodsList(newList);
  };

  const addGoodsItem = () => {
    setGoodsList([...goodsList, { name: "", price: "", qty: "" }]);
  };

  const removeGoodsItem = (idx) => {
    if (goodsList.length === 1) return;
    const newList = [...goodsList];
    newList.splice(idx, 1);
    setGoodsList(newList);
  };

  // Tracking Handlers
  const addBatchTracking = () => {
    if (!trackingNo) return;
    const current = batchTracking ? batchTracking + "," : "";
    setBatchTracking(current + trackingNo);
    setTrackingNo("");
  };

  const handleSubmit = async () => {
    if (!isPrivacyAgreed) {
      alert(t("report.error.privacy"));
      return;
    }
    if (!country) {
      alert(t("report.error.country"));
      return;
    }
    if (!storageId) {
      alert(t("report.error.warehouse"));
      return;
    }

    const payload = {
      country_id: country.id,
      storage_id: storageId,
      express_id: 10577, // Default express ID?
      price: goodsValue,
      remark: remark,
      class_ids: category ? category.category_id : "", // Use ID or Name?
    };

    if (activeTab === 'normal') {
      if (!trackingNo) {
        alert(t("report.error.tracking"));
        return;
      }
      payload.express_sn = trackingNo;

      // Map goods list
      // Original code: form["goodslist"] = formGoodsItem
      // We need to map our goodsList to the expected format
      payload.goodslist = goodsList.map(g => ({
        pinming: g.name,
        danjia: g.price,
        shuliang: g.qty
      }));
    } else {
      // Batch
      if (!batchTracking && !trackingNo) {
        alert(t("report.error.tracking"));
        return;
      }
      let finalTracking = batchTracking;
      // If user typed in input but didn't add to textarea, include it
      if (trackingNo) {
        finalTracking = finalTracking ? finalTracking + "," + trackingNo : trackingNo;
      }
      payload.express_sn = finalTracking;
    }

    setLoading(true);
    setLoadingText(t("common.processing"));

    const endpoint = activeTab === 'normal'
      ? "package/report&wxapp_id=10001"
      : "/package/reportBatch&wxapp_id=10001";

    try {
      const res = await request.post(endpoint, payload);
      if (res.code === 1) {
        alert(t("report.success.submit"));
        navigate(-1); // Go back or clear form
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
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">{t("report.title")}</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100">
        <button
          onClick={() => setActiveTab("normal")}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'normal' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          {t("report.tab_single")}
        </button>
        <button
          onClick={() => setActiveTab("batch")}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'batch' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          {t("report.tab_batch")}
        </button>
      </div>

      <div className="p-4 space-y-4">

        {/* Common Fields */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          {/* Country */}
          <div onClick={handleCountrySelect} className="flex justify-between items-center py-2 border-b border-gray-50 cursor-pointer">
            <div className="flex items-center gap-2 text-gray-700">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" className="w-5 h-5" />
              <span className="font-medium">{t("report.form.country")}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>{country ? country.title : t("report.placeholder.select_country")}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>

          {/* Warehouse */}
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <div className="flex items-center gap-2 text-gray-700">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img26.png" className="w-5 h-5" />
              <span className="font-medium">{t("report.form.warehouse")}</span>
            </div>
            <select
              value={storageId}
              onChange={handleStorageChange}
              className="bg-transparent text-right text-gray-800 text-sm focus:outline-none cursor-pointer dir-rtl"
              style={{ direction: 'rtl' }}
            >
              <option value="">{t("report.placeholder.select_warehouse")}</option>
              {storages.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tracking */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          {activeTab === 'normal' ? (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img40.png" className="w-5 h-5" />
                {t("report.form.tracking_no")}
              </label>
              <input
                type="text"
                value={trackingNo}
                onChange={e => setTrackingNo(e.target.value)}
                placeholder={t("report.placeholder.enter_tracking")}
                className="w-full bg-gray-50 rounded-lg px-3 py-2 text-gray-800 border-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 font-medium">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img40.png" className="w-5 h-5" />
                  {t("report.form.tracking_no")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingNo}
                    onChange={e => setTrackingNo(e.target.value)}
                    placeholder={t("report.placeholder.enter_tracking")}
                    className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-gray-800 border-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button onClick={addBatchTracking} className="bg-blue-50 text-blue-600 px-4 rounded-lg font-bold text-lg">+</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-gray-700 font-medium text-sm">{t("report.form.batch_tracking")}</label>
                <textarea
                  rows="4"
                  value={batchTracking}
                  onChange={e => setBatchTracking(e.target.value)}
                  placeholder={t("report.placeholder.enter_batch_tracking")}
                  className="w-full bg-gray-50 rounded-lg p-3 text-gray-800 border-none focus:ring-1 focus:ring-blue-500 text-sm"
                ></textarea>
                <p className="text-xs text-gray-400">{t("report.form.batch_tip")}</p>
              </div>
            </>
          )}
        </div>

        {/* Goods List (Single Only) */}
        {activeTab === 'normal' && (
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img41.png" className="w-5 h-5" />
                {t("report.form.goods_list")}
              </label>
              <button onClick={addGoodsItem} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium">{t("report.action.add")}</button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-10 gap-2 text-xs text-gray-500 font-medium pb-1 border-b border-gray-100">
              <div className="col-span-4">{t("report.form.goods_name")}</div>
              <div className="col-span-2 text-center">{t("report.form.goods_price")}</div>
              <div className="col-span-2 text-center">{t("report.form.goods_qty")}</div>
              <div className="col-span-2 text-right">#</div>
            </div>

            {/* Table Body */}
            <div className="space-y-2">
              {goodsList.map((item, idx) => (
                <div key={idx} className="grid grid-cols-10 gap-2 items-center">
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => updatedGoodsItem(idx, 'name', e.target.value)}
                      className="w-full bg-gray-50 rounded px-2 py-1.5 text-xs text-gray-800"
                      placeholder={t("report.placeholder.enter_goods_name")}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.price}
                      onChange={e => updatedGoodsItem(idx, 'price', e.target.value)}
                      className="w-full bg-gray-50 rounded px-2 py-1.5 text-xs text-gray-800 text-center"
                      placeholder="￥"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={e => updatedGoodsItem(idx, 'qty', e.target.value)}
                      className="w-full bg-gray-50 rounded px-2 py-1.5 text-xs text-gray-800 text-center"
                      placeholder="1"
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <button onClick={() => removeGoodsItem(idx)} className="text-red-500 p-1 font-bold text-lg">-</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          {/* Category */}
          <div onClick={handleCategorySelect} className="flex justify-between items-center py-2 border-b border-gray-50 cursor-pointer">
            <div className="flex items-center gap-2 text-gray-700">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" className="w-5 h-5" />
              <span className="font-medium">{t("report.form.category")}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>{category ? category.name : t("report.placeholder.select_category")}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>

          {/* Value */}
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <div className="flex items-center gap-2 text-gray-700">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" className="w-5 h-5" />
              <span className="font-medium">{t("report.form.total_value")}</span>
            </div>
            <input
              type="number"
              value={goodsValue}
              onChange={e => setGoodsValue(e.target.value)}
              placeholder={t("report.placeholder.enter_value")}
              className="text-right text-gray-800 text-sm focus:outline-none bg-transparent"
            />
          </div>

          {/* Remark */}
          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img41.png" className="w-5 h-5" />
              {t("report.form.remark")}
            </label>
            <textarea
              rows="2"
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder={t("report.placeholder.enter_remark")}
              className="w-full bg-gray-50 rounded-lg p-3 text-gray-800 border-none focus:ring-1 focus:ring-blue-500 text-sm"
            ></textarea>
          </div>
        </div>

        {/* Privacy */}
        <div className="flex items-center gap-2 px-2">
          <button onClick={() => setIsPrivacyAgreed(!isPrivacyAgreed)} className="focus:outline-none">
            <div className={`w-5 h-5 rounded border flex items-center justify-center ${isPrivacyAgreed ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}>
              {isPrivacyAgreed && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
            </div>
          </button>
          <span className="text-sm text-gray-600">
            {t("report.form.privacy_agree")} <span className="text-blue-600 underline font-medium cursor-pointer">{t("report.form.privacy_link")}</span>
          </span>
        </div>

        {/* Submit */}
        <Button onClick={handleSubmit} className="w-full h-12 text-lg rounded-xl shadow-lg shadow-blue-200 mt-4">
          {t("report.action.submit")}
        </Button>
      </div>

      <Loading is={loading} text={loadingText} />
    </div>
  );
};

export default PackReportPage;