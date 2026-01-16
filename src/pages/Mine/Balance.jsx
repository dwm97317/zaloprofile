import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import request from "../../utils/request";
import Loading from "../../components/Loading/Index";

// 图标组件
const BillIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ExpenseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const RechargeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BalancePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [balanceData, setBalanceData] = useState({
    balance: 0,
    totalRecharge: 0,
    totalExpense: 0,
  });

  useEffect(() => {
    fetchBalanceData();
  }, []);

  const fetchBalanceData = async () => {
    setLoading(true);
    try {
      const res = await request.post("user/detail&wxapp_id=10001");
      console.log('💰 Balance页面 - API响应:', res);
      
      if (res.code === 1 && res.data && res.data.userInfo) {
        const u = res.data.userInfo;
        
        const balance = parseFloat(u.balance) || 0;
        const totalRecharge = parseFloat(u.recharge_money) || 0;
        const totalExpense = parseFloat(u.pay_money) || parseFloat(u.expend_money) || 0;
        
        console.log('💰 余额详情:', {
          原始数据: {
            balance: u.balance,
            recharge_money: u.recharge_money,
            pay_money: u.pay_money,
            expend_money: u.expend_money
          },
          解析后: {
            balance,
            totalRecharge,
            totalExpense
          }
        });
        
        setBalanceData({
          balance: balance,
          totalRecharge: totalRecharge,
          totalExpense: totalExpense,
        });
      } else {
        console.error('❌ Balance页面 - API返回错误:', res);
      }
    } catch (err) {
      console.error("❌ Balance页面 - 获取余额失败:", err);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      icon: BillIcon,
      label: t("mine.wallet.bill_records", "บันทึกบิล"),
      color: "text-blue-500",
      onClick: () => navigate("/mine/balance/log?tab=all"),
    },
    {
      icon: ExpenseIcon,
      label: t("mine.wallet.expense_records", "บันทึกค่าใช้จ่าย"),
      color: "text-red-500",
      onClick: () => navigate("/mine/balance/log?tab=payment"),
    },
    {
      icon: RechargeIcon,
      label: t("mine.wallet.recharge_records", "บันทึกการเติมเงิน"),
      color: "text-green-500",
      onClick: () => navigate("/mine/balance/log?tab=recharge"),
    },
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
        <h1 className="text-lg font-bold ml-2 text-gray-800">
          {t("mine.wallet.title", "บัญชีของฉัน")}
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute right-0 top-0 opacity-10">
            <svg width="150" height="150" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39h-2.05c-.15-.86-.82-1.72-2.55-1.72-1.78 0-2.22.65-2.22 1.33 0 .85.68 1.57 2.65 2.06 2.8.66 4.18 1.58 4.18 3.71 0 1.95-1.67 3.33-3.06 3.67z" />
            </svg>
          </div>

          <div className="relative z-10">
            {/* 余额和充值按钮 */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-blue-100 text-sm mb-1">
                  {t("mine.wallet.total_assets", "สินทรัพย์ทั้งหมด")}(฿)
                </div>
                <div className="text-4xl font-bold">
                  {balanceData.balance.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => navigate("/mine/recharge")}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-2 rounded-xl 
                           text-sm font-bold transition-all border border-white/30 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t("mine.wallet.top_up", "เติมเงิน")}
              </button>
            </div>

            {/* 累计数据 */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
              <div>
                <div className="text-blue-100 text-xs mb-1">
                  {t("mine.wallet.total_recharge", "เติมเงินสะสม")}(฿)
                </div>
                <div className="text-xl font-semibold">
                  {balanceData.totalRecharge.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-blue-100 text-xs mb-1">
                  {t("mine.wallet.total_expense", "ใช้จ่ายสะสม")}(฿)
                </div>
                <div className="text-xl font-semibold">
                  {balanceData.totalExpense.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-3 gap-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                onClick={item.onClick}
                className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl shadow-sm 
                           cursor-pointer active:scale-95 transition-transform"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 
                                flex items-center justify-center ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm text-gray-700 text-center font-medium leading-tight">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Loading is={loading} />
    </div>
  );
};

export default BalancePage;
