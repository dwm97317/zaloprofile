import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { addressFormState, addressInfoState } from "../../state";
import request from "../../utils/request";
import Button from "../../components/Button/Index";
import Loading from "../../components/Loading/Index";
import AddressAutocomplete from "../../components/AddressAutocomplete/index";

const AddressCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const addressInfo = useRecoilValue(addressInfoState);

  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    telcode: "66", // Default to Thailand
    province: "",
    city: "", // Used as District (Amphoe)
    region: "", // Used as Sub-district (Tambon)
    sub_district: "", // Specific field for Thai address
    postal_code: "",
    detail: "",
    identitycard: "",
    clearancecode: "",
    latitude: 0,
    longitude: 0,
    country_id: 2, // Thailand ID in target backend
  });

  useEffect(() => {
    if (addressInfo && addressInfo.address_id) {
      // Parsing legacy region string if needed
      // Assuming database stores: "Country,Province,District,SubDistrict"
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

        // Prefer explicit fields if available, else parse from region string
        province: addressInfo.province || (parts[1] || ""),
        city: addressInfo.city || (parts[2] || ""),
        region: addressInfo.region_raw || (parts[3] || ""), // Using region field for SubDistrict in backend usually
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
      detail: data.detail, // House No / Street
      province: data.province,
      city: data.city, // Amphoe
      sub_district: data.sub_district, // Tambon
      // Update both region fields to be safe (backend dependent)
      region: data.sub_district,
      postal_code: data.postal_code,
      latitude: data.coordinates?.lat || 0,
      longitude: data.coordinates?.lng || 0
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
      // Thailand Structure: Country, Province, District, Sub-district
      // Storing this composite string in 'region' column as per legacy system likely expectations
      // Or just sending individual fields if backend supports it. 
      // Based on previous code, we construct 'region' string.
      const regionStr = `Thailand,${form.province},${form.city},${form.sub_district || form.region}`;

      const payload = {
        ...form,
        region: regionStr,
        // Ensure distinct fields are also sent if backend supports them (generic update)
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
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold ml-2 text-gray-800">
          {form.address_id ? t("address.edit_title", "Edit Address") : t("address.create_title", "Add Address")}
        </h1>
      </div>

      <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Contact Info */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{t("address.section.contact", "Contact Info")}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">{t("address.label.name", "Recipient Name")}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleInput("name", e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder={t("address.placeholder.name", "John Doe")}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">{t("address.label.phone", "Phone Number")}</label>
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
        </div>

        {/* Location Info */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{t("address.section.location", "Location Details")}</h2>
          <div className="space-y-4">

            {/* Autocomplete Search */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-blue-600 mb-1 ml-1">Search Address (Auto-fill)</label>
              <AddressAutocomplete
                onAddressSelect={handleAddressSelect}
                placeholder="Type to search Google Maps..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">{t("address.label.province", "Province")}</label>
                <input
                  type="text"
                  value={form.province}
                  onChange={(e) => handleInput("province", e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Bangkok"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">{t("address.label.city", "District (Amphoe)")}</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleInput("city", e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Bang Kapi"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">{t("address.label.sub_district", "Sub-district (Tambon)")}</label>
                <input
                  type="text"
                  value={form.sub_district}
                  onChange={(e) => handleInput("sub_district", e.target.value)} // Update both for consistency logic
                  onBlur={(e) => handleInput("region", e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Hua Mak"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">{t("address.label.postal_code", "Postal Code")}</label>
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
              <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">{t("address.label.detail", "House No., Street, Building")}</label>
              <textarea
                rows="3"
                value={form.detail}
                onChange={(e) => handleInput("detail", e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="123/45 Moo 6..."
              />
            </div>
          </div>
        </div>

        {/* Customs Info */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{t("address.section.customs", "Customs Information")}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">{t("address.label.identitycard", "ID Card Number")}</label>
              <input
                type="text"
                value={form.identitycard}
                onChange={(e) => handleInput("identitycard", e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                placeholder="13-digit ID"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">{t("address.label.clearancecode", "Customs Clearance Code")}</label>
              <input
                type="text"
                value={form.clearancecode}
                onChange={(e) => handleInput("clearancecode", e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                placeholder="TXXXXXXX"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full h-14 text-lg rounded-2xl shadow-lg hover:shadow-xl mt-4"
          disabled={loading}
        >
          {loading ? t("common.processing", "Processing...") : t("address.submit", "Save Address")}
        </Button>
      </div>

      <Loading is={loading} text={loadingText} />
    </div>
  );
};

export default AddressCreatePage;
