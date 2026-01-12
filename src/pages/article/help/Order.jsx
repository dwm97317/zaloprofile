import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import request from "../../../utils/request";
import Header from "../../../components/Header/Header";
import Loading from "../../../components/Loading/Index";

const OrderHelperPage = () => {
  const { t } = useTranslation();
  const [steps, setSteps] = useState(null);
  const [loading, setLoading] = useState(true);

  const getSetting = async () => {
    try {
      const res = await request.get("page/service&wxapp_id=10001");
      if (res.data && res.data.userclient && res.data.userclient.newuserprocess) {
        setSteps(res.data.userclient.newuserprocess);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSetting();
  }, []);

  const renderStep = (title, remark, iconUrl, stepNum) => {
    if (!title) return null;
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <span className="text-6xl font-bold text-blue-800">{stepNum}</span>
        </div>

        <div className="flex items-start relative z-10">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mr-4">
            <img src={iconUrl} className="w-6 h-6 object-contain" alt="" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{remark}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <Header title={t("help.guide_title")} />

      <div className="p-4">
        {loading ? (
          <Loading is={true} />
        ) : steps ? (
          <div>
            {renderStep(steps.first_title, steps.first_remark, "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img168.png", 1)}
            {renderStep(steps.second_title, steps.second_remark, "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img170.png", 2)}
            {renderStep(steps.third_title, steps.third_remark, "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img170.png", 3)}
            {renderStep(steps.fourth_title, steps.fourth_remark, "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img168.png", 4)}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-20">{t("common.no_data")}</div>
        )}
      </div>
    </div>
  );
};

export default OrderHelperPage;