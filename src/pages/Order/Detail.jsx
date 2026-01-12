import React, { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";
import { packageInfoState } from "../../state";
import util from "../../utils/util";
import Header from "../../components/Header/Header";

const PackDetailPage = () => {
  const { t } = useTranslation();
  const pack_info = useRecoilValue(packageInfoState);

  useEffect(() => {
    util.setBarPageView("Package Detail");
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <Header title={t("package.detail_title", "Package Details")} />

      <div className="p-4 space-y-4">
        {/* Country and Warehouse */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <img 
                src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" 
                className="w-5 h-5 object-contain"
                alt=""
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">
                {t("package.form.country", "Origin Country")}
              </div>
              <div className="font-medium text-gray-800">
                {pack_info.country || t("common.not_provided", "Not provided")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <img 
                src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img26.png" 
                className="w-5 h-5 object-contain"
                alt=""
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">
                {t("package.form.warehouse", "Warehouse")}
              </div>
              <div className="font-medium text-gray-800">
                {pack_info.storage?.shop_name || t("package.form.select_warehouse", "Please select warehouse")}
              </div>
            </div>
          </div>
        </div>

        {/* Package Info */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <img 
                src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img40.png" 
                className="w-5 h-5 object-contain"
                alt=""
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">
                {t("package.form.tracking_no", "Tracking Number")}
              </div>
              <div className="font-medium text-gray-800">
                {pack_info.express_num || t("common.not_provided", "Not provided")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <img 
                src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" 
                className="w-5 h-5 object-contain"
                alt=""
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">
                {t("package.form.category", "Category")}
              </div>
              <div className="font-medium text-gray-800">
                {pack_info.class_name || t("package.form.select_category", "Please select category")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <img 
                src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" 
                className="w-5 h-5 object-contain"
                alt=""
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">
                {t("package.form.value", "Value")} (฿)
              </div>
              <div className="font-medium text-gray-800">
                {pack_info.price || "0"}
              </div>
            </div>
          </div>
        </div>

        {/* Remarks */}
        {pack_info.usermark && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <img 
                  src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img41.png" 
                  className="w-5 h-5 object-contain"
                  alt=""
                />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-2">
                  {t("package.form.remark", "Remarks")}
                </div>
                <div className="text-gray-700 leading-relaxed">
                  {pack_info.usermark}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackDetailPage;