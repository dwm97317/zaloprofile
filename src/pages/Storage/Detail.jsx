import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";
import { storageIdState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import copy from "copy-to-clipboard";
import Button from "../../components/Button/Index";
import Loading from "../../components/Loading/Index";

const StorageDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const storageId = useRecoilValue(storageIdState);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    util.setBarPageView("Warehouse Detail");
    if (storageId) {
      fetchDetail();
    } else {
      // If no storage ID, redirect back
      navigate(-1);
    }
  }, [storageId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await request.get("page/storageDetails&wxapp_id=10001", { id: storageId });
      if (res.data) {
        setDetail(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    const success = copy(text);
    if (success) {
      alert(t("common.copy_success"));
    }
  };

  const handleCopyAll = () => {
    if (!detail) return;
    const text = `${detail.linkman}|${detail.phone}|${detail.address}|${detail.post}`;
    handleCopy(text);
  };

  if (loading) return <Loading is={true} />;
  if (!detail) return <div className="p-4 text-center text-gray-400">{t("common.no_data")}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">{t("storage.detail.title")}</h1>
      </div>

      <div className="px-4 space-y-6">
        {/* Details Container */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
          <InfoRow
            label={t("storage.detail.recipient")}
            value={detail.linkman}
            onCopy={() => handleCopy(detail.linkman)}
            t={t}
          />
          <InfoRow
            label={t("storage.detail.phone")}
            value={detail.phone}
            onCopy={() => handleCopy(detail.phone)}
            t={t}
          />
          <InfoRow
            label={t("storage.detail.address")}
            value={detail.address}
            onCopy={() => handleCopy(detail.address)}
            t={t}
          />
          <InfoRow
            label={t("storage.detail.zip")}
            value={detail.post}
            onCopy={() => handleCopy(detail.post)}
            t={t}
          />

          <Button
            onClick={handleCopyAll}
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200"
          >
            {t("storage.detail.copy_all")}
          </Button>
        </div>

        {/* Guide Container */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-100 p-2 rounded-xl">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img30.png" className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-gray-800 text-lg">{t("storage.guide.title")}</h2>
          </div>

          <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
            <GuideStep
              step={t("storage.guide.step1")}
              desc={t("storage.guide.desc1")}
            />
            <GuideStep
              step={t("storage.guide.step2")}
              desc={t("storage.guide.desc2")}
            />
            <GuideStep
              step={t("storage.guide.step3")}
              desc={t("storage.guide.desc3")}
            />
            <GuideStep
              step={t("storage.guide.step4")}
              desc={t("storage.guide.desc4")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, onCopy, t }) => (
  <div className="flex items-start justify-between group">
    <div className="flex-1 mr-4">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-gray-800 font-medium break-words leading-relaxed">{value || "-"}</div>
    </div>
    <button
      onClick={onCopy}
      className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center gap-1 font-medium whitespace-nowrap"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
      {t("storage.detail.copy")}
    </button>
  </div>
);

const GuideStep = ({ step, desc }) => (
  <div className="pl-8 relative">
    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-blue-100 border-4 border-white shadow-sm z-10"></div>
    <h3 className="font-bold text-gray-800 text-sm mb-1">{step}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">
      {desc}
    </p>
  </div>
);

export default StorageDetailPage;