import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSetRecoilState } from "recoil";
import { takeFormState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import Button from "../../components/Button/Index";
import Loading from "../../components/Loading/Index";

const PackTakePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setTakeForm = useSetRecoilState(takeFormState);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    util.setBarPageView("Take Package");
    util.checkLogin(fetchList).then((isLogged) => {
      if (!isLogged) setTimeout(() => navigate("/mine"), 1000);
    });
    // Clear previous form state on mount
    setTakeForm({});
  }, []);

  const fetchList = async (params = {}) => {
    setLoading(true);
    try {
      const query = { ...params };
      const res = await request.get("package/packageForTaker&wxapp_id=10001", query);
      if (res.data && Array.isArray(res.data.data)) {
        setList(res.data.data);
      } else {
        setList([]);
      }
    } catch (err) {
      console.error(err);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    // Search on blur or enter? Original code was onBlur.
    // Let's do onBlur and Enter key.
    fetchList({ keyword: e.target.value });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchList({ keyword: e.target.value });
    }
  }

  const handleTake = (item) => {
    // Pass the item data to the form. 
    // Assuming the item has 'express_sn' or 'express_no' or similar. 
    // If not, the user might need to fill it manually, but we try to help.
    const prefillData = {
      express_sn: item.express_sn || item.order_sn || "",
      ...item
    };
    setTakeForm(prefillData);
    navigate("/package/takeform");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe flex flex-col">
      {/* Header with Search */}
      <div className="bg-blue-600 px-4 pt-4 pb-8 rounded-b-[2rem] shadow-lg relative z-10">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-2 text-white/90 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white text-center flex-1 mr-8">{t("take.title")}</h1>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border-none rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 bg-white shadow-sm"
            placeholder={t("take.search_placeholder")}
            onBlur={handleSearch}
            onKeyDown={handleKeyDown}
            defaultValue={keyword}
          />
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 px-4 -mt-6 z-20 space-y-4 pb-6 overflow-y-auto">
        {loading ? (
          <div className="py-10"><Loading is={true} /></div>
        ) : list.length > 0 ? (
          list.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img27.png" className="w-4 h-4 object-contain" />
                  <span>{t("take.labels.package_no")}: <span className="text-gray-900 font-bold">{item.express_num || item.express_sn || "N/A"}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-4 flex justify-center text-xs opacity-50">🕒</span>
                  <span>{t("take.labels.enter_time")}: {item.entering_warehouse_time}</span>
                </div>
              </div>

              <Button
                onClick={() => handleTake(item)}
                className="bg-blue-600 text-white text-sm py-2 px-4 rounded-lg shadow-blue-200 h-auto w-auto min-h-0"
              >
                {t("take.take_btn")}
              </Button>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm mt-6">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img29.png" className="w-24 h-24 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400">{t("common.no_data")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackTakePage;