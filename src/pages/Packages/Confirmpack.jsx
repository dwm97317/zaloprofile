import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { addressInfoState, packInfoState, selectState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import Button from "../../components/Button/Index";
import Loading from "../../components/Loading/Index";

const PackConfirmPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const setSelect = useSetRecoilState(selectState);
  const [address, setAddressInfo] = useRecoilState(addressInfoState);
  const packInfos = useRecoilValue(packInfoState);

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(1);
  const [channels, setChannels] = useState([]);
  const [services, setServices] = useState([]);
  const [privacy, setPrivacy] = useState(false);

  // Form State
  const [selectedChannel, setSelectedChannel] = useState(""); // line_id
  const [codAmount, setCodAmount] = useState("");
  const [remark, setRemark] = useState("");

  useEffect(() => {
    util.setBarPageView("Confirm Pack");
    fetchServices();

    if (address) {
      fetchChannels(address.address_id);
    } else {
      fetchDefaultAddress();
    }
  }, []); // Address dependency handled separately or on mount

  const fetchDefaultAddress = async () => {
    try {
      const res = await request.get("address/lists&wxapp_id=10001");
      if (res.code === 1 && res.data.list && res.data.list.length > 0) {
        const defaultAddr = res.data.list.find(a => a.is_default === 1) || res.data.list[0];
        setAddressInfo(defaultAddr);
        fetchChannels(defaultAddr.address_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChannels = async (addressId) => {
    if (!addressId) return;
    try {
      const res = await request.get("package/lineplus&wxapp_id=10001", { address_id: addressId });
      if (res.data && res.data.data) {
        setChannels(res.data.data);
      } else {
        setChannels([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await request.get("package/postservice&wxapp_id=10001");
      if (res.data) {
        // Add is_select property
        const formatted = res.data.map(s => ({ ...s, is_select: false }));
        setServices(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleService = (index) => {
    const newServices = [...services];
    newServices[index].is_select = !newServices[index].is_select;
    setServices(newServices);
  };

  const handleAddressSelect = () => {
    setSelect(true); // Flag to indicate selection mode
    navigate("/address/index");
  };

  const handleSubmit = async () => {
    if (!privacy) {
      alert(t("confirm_pack.error_privacy"));
      return;
    }
    if (!selectedChannel) {
      alert(t("confirm_pack.error_channel"));
      return;
    }
    if (!address && tab === 1) {
      alert(t("confirm_pack.no_address"));
      return;
    }

    setLoading(true);

    const serviceIds = services.filter(s => s.is_select).map(s => s.id).join(",");
    const packIds = Array.isArray(packInfos.ids) ? packInfos.ids.join(",") : packInfos.ids;

    const payload = {
      address_id: address?.address_id,
      line_id: selectedChannel,
      pack_ids: serviceIds, // Note: backend expects 'pack_ids' for services? double check original code. 
      // Original: pack_ids: packIdsStr (service), packids: packidsStr (packages)
      packids: packIds,
      waitreceivedmoney: codAmount || "0",
      remark: remark
    };

    // Confirming mapping from original:
    // const packIdsStr = Array.isArray(service) ? service.join(',') : service;
    // ... pack_ids: packIdsStr
    // So 'pack_ids' field sends SERVICE IDs. Confusing naming in backend but we follow it.

    try {
      const res = await request.post("package/postpack&wxapp_id=10001", payload);
      if (res.code === 1) {
        alert(t("confirm_pack.success"));
        setTimeout(() => {
          navigate("/package/index");
        }, 1000);
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
        <h1 className="text-lg font-bold ml-2 text-gray-800">{t("confirm_pack.title")}</h1>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* Tabs */}
        <div className="bg-white p-1 rounded-xl flex shadow-sm">
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === 1 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setTab(1)}
          >
            {t("confirm_pack.tab_delivery")}
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === 2 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setTab(2)}
          >
            {t("confirm_pack.tab_pickup")}
          </button>
        </div>

        {/* Address Section (Only for Delivery) */}
        {tab === 1 && (
          <div className="bg-white rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img164.png" className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-800">{t("confirm_pack.address_title")}</h3>
                  {address ? (
                    <>
                      <p className="text-sm font-medium text-gray-900">{address.name} <span className="text-gray-500 ml-2">{address.phone}</span></p>
                      <p className="text-xs text-gray-500 leading-snug">{address.province} {address.city} {address.street} {address.detail}</p>
                    </>
                  ) : (
                    <p className="text-sm text-red-500">{t("confirm_pack.no_address")}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleAddressSelect}
                className="text-blue-600 text-sm font-bold px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {t("confirm_pack.change_address")}
              </button>
            </div>
          </div>
        )}

        {/* Package Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h3 className="font-bold text-gray-800">{t("confirm_pack.package_info")}</h3>
            <span className="text-blue-600 font-medium text-sm">
              {t("confirm_pack.total_pack", { count: packInfos.num || 0 })}
            </span>
          </div>

          {/* Channel */}
          <div className="space-y-2">
            <label className="text-sm text-gray-500 flex items-center gap-1">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img26.png" className="w-3 h-3" />
              {t("confirm_pack.channel")}
            </label>
            <select
              className="w-full bg-gray-50 border-none rounded-lg p-3 text-sm font-medium focus:ring-2 focus:ring-blue-100"
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
            >
              <option value="">{t("confirm_pack.select_channel")}</option>
              {channels.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Services */}
          <div className="space-y-2">
            <label className="text-sm text-gray-500 flex items-center gap-1">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img26.png" className="w-3 h-3" />
              {t("confirm_pack.services")}
            </label>
            <div className="bg-orange-50 p-2 rounded-lg text-xs text-orange-700 leading-snug mb-2">
              {t("confirm_pack.service_tip")}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {services.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => toggleService(index)}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-all ${item.is_select ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.is_select ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                    {item.is_select && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-xs font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COD */}
          <div className="space-y-2">
            <label className="text-sm text-gray-500 flex items-center gap-1">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img40.png" className="w-3 h-3" />
              {t("confirm_pack.cod")}
            </label>
            <input
              type="number"
              className="w-full bg-gray-50 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-100"
              placeholder={t("confirm_pack.enter_cod")}
              value={codAmount}
              onChange={(e) => setCodAmount(e.target.value)}
            />
          </div>

          {/* Remark */}
          <div className="space-y-2">
            <label className="text-sm text-gray-500 flex items-center gap-1">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img41.png" className="w-3 h-3" />
              {t("confirm_pack.remark")}
            </label>
            <textarea
              className="w-full bg-gray-50 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-100 min-h-[80px]"
              placeholder={t("confirm_pack.enter_remark")}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>

          {/* Privacy */}
          <div
            className="flex items-center gap-2 pt-2 cursor-pointer"
            onClick={() => setPrivacy(!privacy)}
          >
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                       ${privacy ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
              {privacy && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className="text-xs text-gray-600">{t("confirm_pack.privacy")}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <Button onClick={handleSubmit} className="w-full rounded-xl py-3 text-lg font-bold shadow-blue-200">
          {t("confirm_pack.submit")}
        </Button>
      </div>

      <Loading is={loading} />
    </div>
  );
};

export default PackConfirmPage;