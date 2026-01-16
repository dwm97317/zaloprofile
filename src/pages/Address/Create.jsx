import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";
import { addressInfoState } from "../../state";
import request from "../../utils/request";
import Button from "../../components/Button/Index";
import Loading from "../../components/Loading/Index";
import AddressAutocomplete from "../../components/AddressAutocomplete/index";
import SimpleMapPicker from "../../components/SimpleMapPicker/index";

const AddressCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const addressInfo = useRecoilValue(addressInfoState);

  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

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
    latitude: 0,
    longitude: 0,
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
        province: addressInfo.province || (parts[1] || ""),
        city: addressInfo.city || (parts[2] || ""),
        region: addressInfo.region_raw || (parts[3] || ""),
        sub_district: addressInfo.sub_district || (parts[3] || ""),
        postal_code: addressInfo.postal_code || "",
        detail: addressInfo.detail || "",
        latitude: addressInfo.latitude || 0,
        longitude: addressInfo.longitude || 0,
      });
    }
  }, [addressInfo]);

  const handleInput = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressSelect = (data) => {
    setForm(prev => ({
      ...prev,
      detail: data.detail,
      province: data.province,
      city: data.city,
      postal_code: data.postal_code,
      latitude: data.coordinates?.lat || 0,
      longitude: data.coordinates?.lng || 0
    }));
  };

  const handleMapLocationSelect = (data) => {
    handleAddressSelect(data);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.province) {
      alert(t("address.error.required", "Please fill in required fields"));
      return;
    }

    setLoading(true);
    setLoadingText(t("common.saving", "Saving..."));

    try {
      const regionStr = `Thailand,${form.province},${form.city},`;

      const payload = {
        ...form,
        region: regionStr,
        province: form.province,
        city: form.city,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header with Logistics Theme */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-6 sticky top-0 z-20 shadow-lg">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-white hover:bg-white/20 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 ml-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {form.address_id ? t("address.edit_title", "Edit Delivery Address") : t("address.create_title", "Add Delivery Address")}
            </h1>
            <p className="text-xs text-blue-100 mt-0.5">
              {t("address.subtitle", "Ensure accurate delivery to your location")}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5 pb-24">

        {/* Recipient Information Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">{t("address.section.recipient", "Recipient Information")}</h2>
              <p className="text-xs text-gray-500">{t("address.section.recipient_desc", "Who will receive the package")}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 ml-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t("address.label.name", "Full Name")}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleInput("name", e.target.value)}
                className="w-full bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-transparent focus:border-blue-400 rounded-2xl px-4 py-3.5 focus:ring-0 transition-all placeholder-gray-400"
                placeholder={t("address.placeholder.name", "Enter recipient name")}
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 ml-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {t("address.label.phone", "Phone Number")}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-md">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  +66
                </div>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleInput("phone", e.target.value)}
                  className="flex-1 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-transparent focus:border-blue-400 rounded-2xl px-4 py-3.5 focus:ring-0 transition-all placeholder-gray-400"
                  placeholder="81 234 5678"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map Picker */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">{t("address.section.map", "Pin Your Location")}</h2>
                <p className="text-xs text-gray-500">{t("address.map.desc", "Drag map to select exact location")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">
              <svg className="w-3.5 h-3.5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {t("address.map.hint", "Drag to select")}
            </div>
          </div>
          <SimpleMapPicker 
            onLocationSelect={handleMapLocationSelect}
            initialCenter={form.latitude && form.longitude ? { lat: form.latitude, lng: form.longitude } : null}
          />
        </div>

        {/* Address Details Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">{t("address.section.location", "Address Details")}</h2>
              <p className="text-xs text-gray-500">{t("address.section.location_desc", "Complete your delivery address")}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Quick Search */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border-2 border-dashed border-blue-200">
              <label className="block text-xs font-semibold text-blue-700 mb-2 ml-1 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {t("address.search.label", "Quick Search")}
              </label>
              <AddressAutocomplete
                onAddressSelect={handleAddressSelect}
                placeholder={t("address.search.placeholder", "Search for your address...")}
              />
            </div>

            {/* Province & District */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 ml-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  {t("address.label.province", "Province")}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.province}
                  onChange={(e) => handleInput("province", e.target.value)}
                  className="w-full bg-gradient-to-r from-gray-50 to-green-50 border-2 border-transparent focus:border-green-400 rounded-2xl px-4 py-3 focus:ring-0 transition-all placeholder-gray-400"
                  placeholder="Bangkok"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 ml-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {t("address.label.city", "District")}
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleInput("city", e.target.value)}
                  className="w-full bg-gradient-to-r from-gray-50 to-green-50 border-2 border-transparent focus:border-green-400 rounded-2xl px-4 py-3 focus:ring-0 transition-all placeholder-gray-400"
                  placeholder="Bang Kapi"
                />
              </div>
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 ml-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t("address.label.postal_code", "Postal Code")}
              </label>
              <input
                type="text"
                value={form.postal_code}
                onChange={(e) => handleInput("postal_code", e.target.value)}
                className="w-full bg-gradient-to-r from-gray-50 to-green-50 border-2 border-transparent focus:border-green-400 rounded-2xl px-4 py-3 focus:ring-0 transition-all placeholder-gray-400 font-mono"
                placeholder="10240"
              />
            </div>

            {/* Detailed Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 ml-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t("address.label.detail", "House No., Street, Building")}
              </label>
              <textarea
                rows="3"
                value={form.detail}
                onChange={(e) => handleInput("detail", e.target.value)}
                className="w-full bg-gradient-to-r from-gray-50 to-green-50 border-2 border-transparent focus:border-green-400 rounded-2xl px-4 py-3 focus:ring-0 transition-all placeholder-gray-400 resize-none"
                placeholder={t("address.placeholder.detail", "123/45 Moo 6, Sukhumvit Road...")}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
          <Button
            onClick={handleSubmit}
            className="w-full h-14 text-base font-bold rounded-2xl shadow-2xl hover:shadow-3xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t("common.processing", "Processing...")}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {t("address.submit", "Save Delivery Address")}
              </span>
            )}
          </Button>
        </div>
      </div>

      <Loading is={loading} text={loadingText} />
    </div>
  );
};

export default AddressCreatePage;
