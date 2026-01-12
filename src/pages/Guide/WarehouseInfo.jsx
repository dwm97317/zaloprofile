import React from "react";
import { useTranslation } from "react-i18next";

const WarehouseInfo = ({ data }) => {
  const { t } = useTranslation();

  if (!data) {
    return null;
  }

  return (
    <div className="warehouse-info bg-blue-50 rounded-xl p-4 mb-3 border border-blue-100">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">{t("storage.detail.recipient")}:</span>
          <span className="font-medium text-gray-900">{data.linkman}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t("storage.detail.phone")}:</span>
          <span className="font-medium text-gray-900">{data.phone}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-gray-600">{t("storage.detail.address")}:</span>
          <span className="font-medium text-gray-900 break-words">{data.address}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t("storage.detail.zip")}:</span>
          <span className="font-medium text-gray-900">{data.post}</span>
        </div>
      </div>
    </div>
  );
};

export default WarehouseInfo;
