import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";
import { lineIdState } from "../../state";
import request from "../../utils/request";
import Header from "../../components/Header/Header";
import util from "../../utils/util";
import Loading from "../../components/Loading/Index";

const LineDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const lineId = useRecoilValue(lineIdState);
  const [detail, setDetail] = useState({});
  const [loading, setLoading] = useState(true);
  
  const getDetailList = async () => {
    try {
      const res = await request.get("page/lineDetails&wxapp_id=10001", { id: lineId });
      if (res.data) {
        setDetail(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch line details", error);
    } finally {
      setLoading(false);
    }
  };

  const renderFreeMode = () => {
    if (detail.free_mode === 1 || detail.free_mode === 4) {
      return (
        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">{t("common_page.weight_limit", "First Weight")}: 1kg</span>
            <span className="font-medium text-gray-800">45฿/kg</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">{t("common_page.weight_limit", "Additional Weight")}: 3kg</span>
            <span className="font-medium text-gray-800">56฿/kg</span>
          </div>
        </div>
      );
    } else if (detail.free_mode === 2 && detail.free_rule) {
      return (
        <div className="space-y-3">
          {detail.free_rule.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t("common_page.weight_limit", "First Weight")}: {item.first_weight}kg</span>
                <span className="font-medium text-gray-800">{item.first_price}฿/kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t("common_page.weight_limit", "Additional Weight")}: {item.next_weight}kg</span>
                <span className="font-medium text-gray-800">{item.next_price}฿/kg</span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    util.setBarPageView("Line Detail");
    getDetailList();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <Header title={t("common_page.line_detail_title", "Route Details")} />

      {loading ? (
        <Loading is={true} />
      ) : (
        <div className="p-4 space-y-4">
          {/* Line Info */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              {t("common_page.line_info", "Shipping Information")}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">{t("common_page.route_name", "Route Name")}</span>
                <span className="font-medium text-gray-800">{detail.name}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">{t("common_page.calc_method", "Calculation Method")}</span>
                <span className="font-medium text-gray-800">
                  {detail.free_mode && t(`common_page.calc_methods.${detail.free_mode - 1}`, "Standard")}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">{t("common_page.delivery_time", "Delivery Time")}</span>
                <span className="font-medium text-gray-800">{detail.limitationofdelivery}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">{t("common_page.est_tax", "Estimated Tax")}</span>
                <span className="font-medium text-gray-800">{detail.tariff || 0}%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">{t("common_page.value_added", "Value Added Services")}</span>
                <span className="font-medium text-gray-800">{detail.service_route || 0}฿</span>
              </div>
            </div>
          </div>

          {/* Fee Standard */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              {t("common_page.fee_standard", "Fee Standard")}
            </h3>
            {renderFreeMode()}
          </div>

          {/* Line Features */}
          {detail.line_special && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                {t("common_page.line_feature", "Route Features")}
              </h3>
              <p className="text-gray-700 leading-relaxed">{detail.line_special}</p>
            </div>
          )}

          {/* Limitations */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              {t("common_page.limitations", "Limitations")}
            </h3>
            <div className="space-y-4">
              {detail.goods_limit && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    {t("common_page.goods_limit", "Goods Limit")}
                  </h4>
                  <p className="text-gray-600 text-sm">{detail.goods_limit}</p>
                </div>
              )}
              {detail.weight_limit && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    {t("common_page.weight_limit", "Weight Limit")}
                  </h4>
                  <p className="text-gray-600 text-sm">{detail.weight_limit}</p>
                </div>
              )}
              {detail.length_limit && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    {t("common_page.length_limit", "Length Limit")}
                  </h4>
                  <p className="text-gray-600 text-sm">{detail.length_limit}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LineDetailPage;