import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import request from "../../utils/request";
import util from "../../utils/util";
import Loading from "../../components/Loading/Index";

const OrderVerifyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    util.setBarPageView("Verify");
    fetchVerifyList();
  }, []);

  const fetchVerifyList = async () => {
    setLoading(true);
    try {
      const res = await request.get("package/verify&wxapp_id=10001");
      if (res.data && res.data.data) {
        setList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    // Logic from original code: navigate("/package/verify/detail");
    // Need to potentially pass ID
    navigate(`/package/verify/detail`);
    // Note: original code didn't pass ID in navigate strictly, just called targetDetail(e, id) which did navigate("/package/verify/detail")
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
        <h1 className="text-lg font-bold ml-2 text-gray-800">{t("verify.title")}</h1>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <Loading is={true} />
        ) : list.length > 0 ? (
          list.map((item, index) => (
            <div key={index} onClick={() => handleItemClick(item)} className="bg-white rounded-xl p-4 shadow-sm">
              {/* Render item content generically since structure is unknown from original empty code */}
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify(item, null, 2)}
              </pre>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm">{t("verify.no_data")}</div>
        )}
      </div>
    </div>
  );
};

export default OrderVerifyPage;