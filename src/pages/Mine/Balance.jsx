import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import util from "../../utils/util";

const BalancePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    util.setBarPageView("My Balance");
  }, []);

  const menuItems = [
    {
      icon: "https://zhuanyun.sllowly.cn/assets/api/images//dzx_img122.png",
      label: t("mine.wallet.account_detail"),
      path: "/mine/recharge/detail" // Assuming path, check routes later
    },
    {
      icon: "https://zhuanyun.sllowly.cn/assets/api/images//dzx_img124.png",
      label: t("mine.wallet.bank_account"),
      path: "/mine/transfer"
    },
    {
      icon: "https://zhuanyun.sllowly.cn/assets/api/images//dzx_img125.png",
      label: t("mine.wallet.upload_proof"),
      path: "/mine/upload-proof"
    },
    {
      icon: "https://zhuanyun.sllowly.cn/assets/api/images//dzx_img126.png",
      label: t("mine.wallet.payment_history"),
      path: "/mine/payment-history"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">{t("mine.wallet.title")}</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
            <svg width="150" height="150" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39h-2.05c-.15-.86-.82-1.72-2.55-1.72-1.78 0-2.22.65-2.22 1.33 0 .85.68 1.57 2.65 2.06 2.8.66 4.18 1.58 4.18 3.71 0 1.95-1.67 3.33-3.06 3.67z" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="text-blue-100 text-sm font-medium mb-1">{t("mine.balance")} (VNĐ)</div>
            <div className="text-4xl font-bold mb-6">200.00</div>

            <button
              onClick={() => navigate("/mine/recharge")}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-2 rounded-xl text-sm font-bold transition-all border border-white/30 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              {t("mine.wallet.top_up")}
            </button>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img src={item.icon} className="w-8 h-8 object-contain" />
                <span className="text-gray-700 font-medium">{item.label}</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BalancePage;