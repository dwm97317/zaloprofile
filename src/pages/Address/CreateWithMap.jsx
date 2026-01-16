import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { addressInfoState } from "../../state";
import request from "../../utils/request";
import Button from "../../components/Button/Index";
import Loading from "../../components/Loading/Index";
import AddressAutocomplete from "../../components/AddressAutocomplete/index";
import InteractiveMapPicker from "../../components/InteractiveMapPicker/index";

/**
 * Enhanced Address Create Page with Interactive Map
 * 
 * 增强版地址创建页面 - 集成交互式地图选择器
 */
const AddressCreateWithMapPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const addressInfo = useRecoilValue(addressInfoState);

  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [showMap, setShowMap] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    telcode: "66",
    province: "",
    city: "",
    region: "",
    sub_district: "",
    postal_code: "",
    detail: "",
    identitycard: "",
    clearancecode: "",
    latitude: 13.7563, // Default Bangkok
    longitude: 100.5018,
    country_id: 2,
  });

  useEffect(() => {
    if (addressInfo && addressInfo.address_id) {
      let parts = [];
      if (addressInfo.region && addressInfo.region.includes(",")) {
        parts = addressInfo.region.split(",");
      }

      setForm({
        ...form,
        ...addressInfo,
        name: addressInfo.name || "",
        phone: addressInfo.phone || "",
        identitycard: addressInfo.identitycard || "",
        clearancecode: addressInfo.clearancecode || "",
        province: addressInfo.province || (parts[1] || ""),
        city: addressInfo.city || (parts[2] || ""),
        region: addressInfo.region_raw || (parts[3] || ""),
        sub_district: addressInfo.sub_district || (parts[3] || ""),
        postal_code: addressInfo.postal_code || "",
        detail: addressInfo.detail || "",
        latitude: addressInfo.latitude || 13.7563,
        longitude: addressInfo.longitude || 100.5018,
      });
    }
  }, [addressInfo]);

  const handleInput = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // 地址搜索选择回调
  const handleAddressSelect = (data) => {
    setForm(prev => ({
      ...prev,
      detail: data.detail,
      province: data.province,
      city: data.city,
      sub_district: data.sub_district,
      region: data.sub_district,
      postal_code: data.postal_code,
      latitude: data.coordinates?.lat || prev.latitude,
      longitude: data.coordinates?.lng || prev.longitude
    }));
  };

  // 地图位置选择回调
  const handleLocationSelect = (data) => {
    setForm(prev => ({
      ...prev,
      province: data.province || prev.province,
      city: data.city || prev.city,
      sub_district: data.sub_district || prev.sub_district,
      region: data.sub_district || prev.region,
      postal_code: data.postal_code || prev.postal_code,
      detail: data.detail || prev.detail,
      latitude: data.coordinates?.lat || prev.latitude,
      longitude: data.coordinates?.lng || prev.longitude
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.province) {
      alert(t("address.error.required", "Please fill in required fields"));
      return;
    }

    setLoading(true);
    setLoadingText(t("common.saving", "Saving..."));

    try {
      const regionStr = `Thailand,${form.province},${form.city},${form.sub_district || form.region}`;

      const payload = {
        ...form,
        region: regionStr,
        province: form.province,
        city: form.city,
        sub_district: form.sub_district || form.region,
        userstree: form.detail,
      };

      const res = await request.post("address/add&wxapp_id=10001", payload);
      if (res.code === 1) {
        alert(t("address.success.save", "Address saved successfully"));
        navigate(-1);
      } else {
        alert(res.msg || t("address.error.save", "Failed to save address"));
      }
    } catch (err) {
      console.error("Save address error:", err);
      alert(t("common.error_network", "Network error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-10">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold ml-2 text-gray-800">
          {form.address_id ? t("address.edit_title", "แก้ไขที่อยู่") : t("address.create_title", "เพิ่มที่อยู่")}
        </h1>
      </div>

      <div className="p-4 space-y-6">

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-xl text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              {t("address.section.contact", "ข้อมูลผู้รับ")}
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">
                {t("address.label.name", "ชื่อผู้รับ")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleInput("name", e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder={t("address.placeholder.name", "สมชาย ใจดี")}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">
                {t("address.label.phone", "เบอร์โทรศัพท์")} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl text-gray-600 font-bold">+66</div>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleInput("phone", e.target.value)}
                  className="flex-1 bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="081 234 5678"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Location Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-green-400 to-green-600 p-2 rounded-xl text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              {t("address.section.location", "ที่อยู่จัดส่ง")}
            </h2>
          </div>

          <div className="space-y-4">
            {/* Address Search */}
            <div>
              <label className="block text-xs font-semibold text-blue-600 mb-1 ml-1">
                🔍 {t("address.label.search", "ค้นหาที่อยู่ (Google Maps)")}
              </label>
              <AddressAutocomplete
                onAddressSelect={handleAddressSelect}
                placeholder={t("address.placeholder.search", "พิมพ์เพื่อค้นหาที่อยู่...")}
              />
            </div>

            {/* Map Toggle Button */}
            <button
              onClick={() => setShowMap(!showMap)}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              {showMap 
                ? t("address.button.hide_map", "ซ่อนแผนที่") 
                : t("address.button.show_map", "เลือกจากแผนที่")
              }
            </button>

            {/* Interactive Map */}
            <AnimatePresence>
              {showMap && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <InteractiveMapPicker
                    initialLat={form.latitude}
                    initialLng={form.longitude}
                    onLocationSelect={handleLocationSelect}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Address Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">
                  {t("address.label.province", "จังหวัด")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.province}
                  onChange={(e) => handleInput("province", e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="กรุงเทพมหานคร"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">
                  {t("address.label.city", "เขต/อำเภอ")}
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleInput("city", e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="บางกะปิ"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">
                  {t("address.label.sub_district", "แขวง/ตำบล")}
                </label>
                <input
                  type="text"
                  value={form.sub_district}
                  onChange={(e) => {
                    handleInput("sub_district", e.target.value);
                    handleInput("region", e.target.value);
                  }}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="หัวหมาก"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">
                  {t("address.label.postal_code", "รหัสไปรษณีย์")}
                </label>
                <input
                  type="text"
                  value={form.postal_code}
                  onChange={(e) => handleInput("postal_code", e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="10240"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">
                {t("address.label.detail", "บ้านเลขที่, ถนน, อาคาร")}
              </label>
              <textarea
                rows="3"
                value={form.detail}
                onChange={(e) => handleInput("detail", e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="123/45 หมู่ 6 ถนนรามคำแหง..."
              />
            </div>
          </div>
        </motion.div>

        {/* Customs Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-2 rounded-xl text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              {t("address.section.customs", "ข้อมูลศุลกากร")}
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">
                {t("address.label.identitycard", "เลขบัตรประชาชน")}
              </label>
              <input
                type="text"
                value={form.identitycard}
                onChange={(e) => handleInput("identitycard", e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                placeholder="1-2345-67890-12-3"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">
                {t("address.label.clearancecode", "รหัสผ่านศุลกากร")}
              </label>
              <input
                type="text"
                value={form.clearancecode}
                onChange={(e) => handleInput("clearancecode", e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                placeholder="TXXXXXXX"
              />
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleSubmit}
            className="w-full h-14 text-lg rounded-2xl shadow-lg hover:shadow-xl"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                <span>{t("common.processing", "กำลังบันทึก...")}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{t("address.submit", "บันทึกที่อยู่")}</span>
              </div>
            )}
          </Button>
        </motion.div>
      </div>

      <Loading is={loading} text={loadingText} />
    </div>
  );
};

export default AddressCreateWithMapPage;
