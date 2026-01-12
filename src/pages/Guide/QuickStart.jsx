import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { orderStatusState } from "../../state";
import request from "../../utils/request";
import { toast } from "../../utils/toast";
import copy from "copy-to-clipboard";
import StepCard from "./StepCard";
import WarehouseInfo from "./WarehouseInfo";
import NoticeBox from "./NoticeBox";
import QuickLinks from "./QuickLinks";

const QuickStartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setOrderStatus = useSetRecoilState(orderStatusState);
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch default warehouse on mount
  useEffect(() => {
    fetchDefaultWarehouse();
  }, []);

  const fetchDefaultWarehouse = async () => {
    try {
      setLoading(true);
      const res = await request.get("page/getStorageFirst&wxapp_id=10001");
      if (res.code === 1 && res.data) {
        setWarehouse(res.data);
      } else {
        toast.error(t("guide.step1.error"));
      }
    } catch (error) {
      console.error("获取仓库信息失败:", error);
      toast.error(t("guide.step1.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (type) => {
    if (!warehouse) {
      toast.error(t("guide.step1.no_warehouse"));
      return;
    }

    // Build address text
    let addressText = warehouse.address;
    
    // If sea shipping, append " SEA"
    if (type === 'sea') {
      addressText = `${warehouse.address} SEA`;
    }
    
    // Full text format: recipient|phone|address|postal_code
    const fullText = `${warehouse.linkman}|${warehouse.phone}|${addressText}|${warehouse.post}`;
    
    // Copy to clipboard
    const success = copy(fullText);
    
    if (success) {
      if (type === 'sea') {
        toast.success(t("guide.step1.copy_sea_success"));
      } else {
        toast.success(t("guide.step1.copy_land_success"));
      }
    } else {
      toast.error(t("common.error"));
    }
  };

  const handleStep3 = (action) => {
    if (action === 'pack') {
      navigate('/package/pack/select');
    } else if (action === 'address') {
      navigate('/address/index');
    }
  };

  const handleStep4 = () => {
    setOrderStatus(2); // Set to pending payment status
    navigate('/order/index');
  };

  // Step configurations
  const steps = [
    {
      id: 1,
      icon: "📦",
      gradient: "from-blue-400 to-blue-600",
      title: t("guide.step1.title"),
      description: t("guide.step1.description")
    },
    {
      id: 2,
      icon: "📋",
      gradient: "from-green-400 to-green-600",
      title: t("guide.step2.title"),
      description: t("guide.step2.description"),
      action: t("guide.step2.action"),
      onClick: () => navigate('/package/forecast')
    },
    {
      id: 3,
      icon: "📦",
      gradient: "from-orange-400 to-orange-600",
      title: t("guide.step3.title"),
      description: t("guide.step3.description")
    },
    {
      id: 4,
      icon: "💳",
      gradient: "from-purple-400 to-purple-600",
      title: t("guide.step4.title"),
      description: t("guide.step4.description"),
      action: t("guide.step4.action"),
      onClick: handleStep4
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 px-4 py-6 shadow-lg">
        <button onClick={() => navigate(-1)} className="mb-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-black text-white mb-2">{t("guide.title")}</h1>
        <p className="text-white/90 text-sm">{t("guide.subtitle")}</p>
      </div>

      {/* Steps */}
      <div className="px-4 py-6 space-y-4">
        {/* Step 1 - Copy Warehouse Address */}
        <StepCard step={steps[0]} index={0}>
          {loading ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              {t("guide.step1.loading")}
            </div>
          ) : warehouse ? (
            <>
              <WarehouseInfo data={warehouse} />
              <NoticeBox 
                type="info" 
                message={t("guide.step1.notice")} 
              />
              <div className="grid grid-cols-2 gap-3 mt-3">
                <button
                  onClick={() => handleCopy('land')}
                  className="py-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600
                           text-white font-bold shadow-lg
                           hover:shadow-xl hover:scale-105 active:scale-95
                           transition-all duration-200
                           flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span className="text-sm">{t("guide.step1.copy_land")}</span>
                </button>
                <button
                  onClick={() => handleCopy('sea')}
                  className="py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600
                           text-white font-bold shadow-lg
                           hover:shadow-xl hover:scale-105 active:scale-95
                           transition-all duration-200
                           flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span className="text-sm">{t("guide.step1.copy_sea")}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-red-600 text-sm mb-3">{t("guide.step1.error")}</p>
              <button
                onClick={fetchDefaultWarehouse}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm
                         hover:bg-blue-600 active:scale-95 transition-all"
              >
                {t("common.loading")}
              </button>
            </div>
          )}
        </StepCard>

        {/* Step 2 - Report Package */}
        <StepCard step={steps[1]} index={1} />

        {/* Step 3 - Apply for Packing */}
        <StepCard step={steps[2]} index={2}>
          <NoticeBox 
            type="warning" 
            message={t("guide.step3.notice")} 
          />
          <div className="space-y-2 mt-3">
            {/* Primary action: Apply for packing */}
            <button
              onClick={() => handleStep3('pack')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600
                       text-white font-bold shadow-lg
                       hover:shadow-xl hover:scale-105 active:scale-95
                       transition-all duration-200
                       flex items-center justify-center gap-2"
            >
              <span>{t("guide.step3.action")}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            {/* Secondary action: Manage address */}
            <button
              onClick={() => handleStep3('address')}
              className="w-full py-2.5 rounded-xl border-2 border-orange-300 text-orange-600
                       font-medium hover:bg-orange-50 active:scale-95
                       transition-all duration-200
                       flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{t("guide.step3.manage_address")}</span>
            </button>
          </div>
        </StepCard>

        {/* Step 4 - Pay Shipping Fee */}
        <StepCard step={steps[3]} index={3} />
      </div>

      {/* Quick Links */}
      <QuickLinks />

      {/* Help Section */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
          <p className="text-gray-600 mb-2">{t("guide.need_help")}</p>
          <p className="text-primary-600 font-bold">{t("guide.contact_support")}</p>
        </div>
      </div>
    </div>
  );
};

export default QuickStartPage;
