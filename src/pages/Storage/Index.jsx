import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { storageIdState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";

const StoragePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setStorageId = useSetRecoilState(storageIdState);
  const [list, setList] = useState([]);

  useEffect(() => {
    util.setBarPageView("Storage List");
    fetchStorageList();
  }, []);

  const fetchStorageList = async () => {
    try {
      const res = await request.get("page/storageList&wxapp_id=10001");
      if (Array.isArray(res.data)) {
        setList(res.data);
      } else {
        setList([]);
      }
    } catch (error) {
      console.error(error);
      setList([]);
    }
  };

  const handleItemClick = (id) => {
    setStorageId(id);
    navigate("/storage/detail");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2">{t("storage.title")}</h1>
      </div>

      <div className="p-4 space-y-4">
        {list.map((item, index) => (
          <div
            key={index}
            onClick={() => handleItemClick(item.shop_id)}
            className="bg-white rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-3">{item.shop_name || t("storage.unknown_warehouse")}</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img198.png" className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-60" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.region && item.region.province
                    ? `${item.region.province}${item.region.city}${item.region.region}${item.address}`
                    : (item.address || t("storage.no_address"))}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img199.png" className="w-5 h-5 flex-shrink-0 opacity-60" />
                <p className="text-sm text-gray-600 font-medium">
                  {item.phone || t("storage.no_phone")}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
              <span className="text-blue-600 text-sm font-bold flex items-center">
                {t("storage.view_detail")} &rarr;
              </span>
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            {t("common.loading")}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoragePage;