import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "../../utils/toast";
import Dropdown from "../Common/Dropdown";

// 数字转中文
const numberToChinese = (num) => {
  const chineseDigits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  return String(num).split('').map(d => chineseDigits[parseInt(d)] || d).join('');
};

/**
 * 地址复制卡片组件
 * 支持唛头+仓库双选择器，实时预览组合地址
 */
const AddressCopyCard = ({
  marks = [],
  warehouses = [],
  selectedMark,
  selectedWarehouse,
  onMarkChange,
  onWarehouseChange,
  userId = '',
}) => {
  const { t } = useTranslation();
  const [showMarkDropdown, setShowMarkDropdown] = useState(false);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);

  // 获取格式化的唛头+UID（中文）- 格式：CODE:UID室
  const getFormattedMarkUidChinese = () => {
    if (!selectedMark) return '';
    if (!userId) return selectedMark;
    const chineseUid = numberToChinese(userId);
    return `${selectedMark}:${chineseUid}室`;
  };

  // 获取格式化的唛头+UID（原始）- 格式：CODE:UID
  const getFormattedMarkUid = () => {
    if (!selectedMark) return '';
    if (!userId) return selectedMark;
    return `${selectedMark}:${userId}`;
  };

  // 组合地址信息
  const addressInfo = selectedWarehouse
    ? {
        receiver: selectedWarehouse.linkman,
        phone: selectedWarehouse.phone,
        address: selectedWarehouse.address,
        fullAddress: getFormattedMarkUidChinese() 
          ? `${selectedWarehouse.address} ${getFormattedMarkUidChinese()}`
          : selectedWarehouse.address,
        markUid: getFormattedMarkUid(),
        postcode: selectedWarehouse.post,
      }
    : null;

  // 复制完整地址
  const handleCopy = async () => {
    if (!addressInfo) {
      toast.error(t("mark.select_warehouse_first", "请先选择仓库"));
      return;
    }

    let text = `${t("storage.detail.recipient", "收件人")}: ${addressInfo.receiver}
${t("storage.detail.phone", "电话")}: ${addressInfo.phone}
${t("storage.detail.address", "地址")}: ${addressInfo.fullAddress}
${t("storage.detail.zip", "邮编")}: ${addressInfo.postcode}`;

    if (addressInfo.markUid) {
      text += `\n${t("storage.detail.mark_uid", "唛头/会员号")}: ${addressInfo.markUid}`;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      toast.success(t("common.copy_success", "คัดลอกสำเร็จ"));
    } catch (err) {
      toast.error(t("common.copy_failed", "คัดลอกไม่สำเร็จ"));
    }
  };

  // 唛头选项
  const markOptions = marks.map((m) => ({
    value: m.mark,
    label: m.mark,
    data: m,
  }));

  // 仓库选项
  const warehouseOptions = warehouses.map((w) => ({
    value: w.shop_id,
    label: w.shop_name,
    data: w,
  }));

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📋</span>
        <span className="font-medium text-gray-800">
          {t("mark.quick_copy_address", "快速复制地址")}
        </span>
      </div>

      {/* 双选择器 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* 唛头选择器 */}
        <Dropdown
          label={t("mark.select_mark", "选择唛头")}
          value={selectedMark}
          options={markOptions}
          onChange={(value) => onMarkChange(value)}
          open={showMarkDropdown}
          onToggle={() => {
            setShowMarkDropdown(!showMarkDropdown);
            if (showWarehouseDropdown) setShowWarehouseDropdown(false);
          }}
        />

        {/* 仓库选择器 */}
        <Dropdown
          label={t("mark.select_warehouse", "选择仓库")}
          value={selectedWarehouse?.shop_name || ""}
          options={warehouseOptions}
          onChange={(_, data) => onWarehouseChange(data)}
          open={showWarehouseDropdown}
          onToggle={() => {
            setShowWarehouseDropdown(!showWarehouseDropdown);
            if (showMarkDropdown) setShowMarkDropdown(false);
          }}
        />
      </div>

      {/* 地址预览 */}
      {addressInfo && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm space-y-1">
          <div>
            <span className="text-gray-500">{t("storage.detail.recipient", "收件人")}:</span>{" "}
            <span className="text-gray-800">{addressInfo.receiver}</span>
          </div>
          <div>
            <span className="text-gray-500">{t("storage.detail.phone", "电话")}:</span>{" "}
            <span className="text-gray-800">{addressInfo.phone}</span>
          </div>
          <div>
            <span className="text-gray-500">{t("storage.detail.address", "地址")}:</span>{" "}
            <span className="text-gray-800">{addressInfo.fullAddress}</span>
          </div>
          <div>
            <span className="text-gray-500">{t("storage.detail.zip", "邮编")}:</span>{" "}
            <span className="text-gray-800">{addressInfo.postcode}</span>
          </div>
          {addressInfo.markUid && (
            <div>
              <span className="text-gray-500">{t("storage.detail.mark_uid", "唛头/会员号")}:</span>{" "}
              <span className="text-gray-800 font-medium">{addressInfo.markUid}</span>
            </div>
          )}
        </div>
      )}

      {/* 复制按钮 */}
      <button
        onClick={handleCopy}
        disabled={!addressInfo}
        className={`w-full py-3 rounded-xl font-medium transition-all
          ${
            addressInfo
              ? "bg-primary-500 text-white active:scale-[0.98]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
      >
        {t("mark.copy_full_address", "复制完整地址")}
      </button>
    </div>
  );
};

export default AddressCopyCard;
