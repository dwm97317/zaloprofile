import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import request from "../../utils/request";
import Loading from "../../components/Loading/Index";

const BalanceLogPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const tabs = [
    { key: 'all', label: t("mine.wallet.all", "ทั้งหมด") },
    { key: 'recharge', label: t("mine.wallet.recharge", "เติมเงิน") },
    { key: 'payment', label: t("mine.wallet.payment", "ชำระเงิน") },
  ];

  useEffect(() => {
    fetchLogs(activeTab, 1);
  }, [activeTab]);

  const fetchLogs = async (type, pageNum) => {
    setLoading(true);
    try {
      // API路径: user/balanceLog (在api模块的User控制器中)
      const params = {
        page: pageNum,
      };
      
      // 根据Tab类型设置scene参数
      // type: 'all' = 不设置scene (显示全部)
      // type: 'recharge' = scene=1 (充值, sence_type=1)
      // type: 'payment' = scene=2 (消费, sence_type=2)
      if (type === 'recharge') {
        params.scene = 1;
      } else if (type === 'payment') {
        params.scene = 2;
      }
      
      const res = await request.get("user/balanceLog", params);
      
      if (res.code === 1 && res.data) {
        const newLogs = res.data.list?.data || [];
        setLogs(pageNum === 1 ? newLogs : [...logs, ...newLogs]);
        setHasMore(newLogs.length === 15); // 后端每页15条
        setPage(pageNum);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setLogs([]);
    setPage(1);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchLogs(activeTab, page + 1);
    }
  };

  const formatTime = (timeStr) => {
    try {
      // 后端返回的是Unix时间戳（秒）
      const timestamp = typeof timeStr === 'number' ? timeStr : parseInt(timeStr);
      const date = new Date(timestamp * 1000); // 转换为毫秒
      return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return timeStr;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold ml-2 text-gray-800">
            {t("mine.wallet.balance_log", "รายละเอียดยอดเงิน")}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mt-3">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log List */}
      <div className="mt-2">
        {logs.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 text-sm">{t("mine.wallet.no_records", "ไม่มีบันทึก")}</p>
          </div>
        ) : (
          <div className="bg-white">
            {logs.map((log, index) => (
              <div key={`${log.log_id}-${index}`} 
                   className="p-4 border-b border-gray-100 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">
                      {formatTime(log.create_time)}
                    </div>
                    <div className="text-base font-medium text-gray-800 mt-1">
                      {log.describe}
                    </div>
                    {log.remark && (
                      <div className="text-xs text-gray-400 mt-1">
                        {t("mine.wallet.admin_remark", "หมายเหตุ")}: {log.remark}
                      </div>
                    )}
                  </div>
                  <div className={`text-lg font-bold ml-4 ${
                    log.sence_type === 1 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {log.sence_type === 1 ? '+' : '-'}{parseFloat(log.money).toFixed(2)}฿
                  </div>
                </div>
              </div>
            ))}

            {/* Load More */}
            {hasMore && !loading && (
              <div className="p-4 text-center">
                <button
                  onClick={loadMore}
                  className="text-blue-500 text-sm font-medium hover:text-blue-600 transition"
                >
                  {t("common.load_more", "โหลดเพิ่มเติม")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Loading is={loading} />
    </div>
  );
};

export default BalanceLogPage;
