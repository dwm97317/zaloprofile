import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { storageIdState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import { toast } from "../../utils/toast";
import Dropdown from "../../components/Common/Dropdown";
import { CopyIcon, WarehouseIcon, ChevronRightIcon, MapIcon, UserIcon } from "../../components/Icons";
import Tab from "../../components/Tab/Tab";

// 数字转中文
const numberToChinese = (num) => {
  const chineseDigits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  return String(num).split('').map(d => chineseDigits[parseInt(d)] || d).join('');
};

const StoragePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setStorageId = useSetRecoilState(storageIdState);
  const [list, setList] = useState([]);
  const [userMarks, setUserMarks] = useState([]);
  const [userId, setUserId] = useState('');
  const [selectedMarkByWarehouse, setSelectedMarkByWarehouse] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    util.setBarPageView("Storage List");
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [storageRes, userRes] = await Promise.all([
        request.get("page/storageList&wxapp_id=10001"),
        request.post("user/detail&wxapp_id=10001"),
      ]);

      // 处理仓库列表
      const storageList = Array.isArray(storageRes.data) ? storageRes.data : [];
      setList(storageList);

      // 处理用户唛头和 UID
      let marks = [];
      let uid = '';

      if (userRes.code === 1 && userRes.data?.userInfo) {
        const u = userRes.data.userInfo;
        marks = u.usermark || [];
        uid = String(u.uid || u.id || '');
      }

      // 如果 API 没有返回 UID，从 localStorage 获取
      if (!uid) {
        uid = localStorage.getItem("userId") || localStorage.getItem("lineUserId") || '';
      }

      // console.log('Fetched UID:', uid, 'Marks:', marks);

      setUserMarks(marks);
      setUserId(uid);

      // 为每个仓库初始化默认选中的唛头
      const initialSelection = {};
      storageList.forEach(item => {
        initialSelection[item.shop_id] = marks.length > 0 ? marks[0].mark : '';
      });
      setSelectedMarkByWarehouse(initialSelection);
    } catch (error) {
      console.error(error);
      setList([]);
      const uid = localStorage.getItem("userId") || localStorage.getItem("lineUserId") || '';
      setUserId(uid);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (id) => {
    setStorageId(id);
    navigate("/storage/detail");
  };

  const handleMarkChange = (warehouseId, mark) => {
    setSelectedMarkByWarehouse(prev => ({
      ...prev,
      [warehouseId]: mark
    }));
  };

  const handleCopy = async (text, e) => {
    e?.stopPropagation();
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

  // 获取基础地址
  const getBaseAddress = (item) => {
    return item.region && item.region.province
      ? `${item.region.province}${item.region.city}${item.region.region}${item.address}`
      : (item.address || t("storage.no_address"));
  };

  // 获取唛头+UID 组合值（中文数字）- 格式：CODE:UID室
  const getMarkAndUidChinese = (selectedMark) => {
    const parts = [];
    if (selectedMark) {
      parts.push(selectedMark);
    }
    if (userId) {
      // UID 转中文数字，格式：CODE:UID室
      const chineseUid = numberToChinese(userId);
      parts.push(`:${chineseUid}室`);
    }
    return parts.join('');
  };

  // 获取唛头+UID 组合值（原始数字）- 格式：CODE:UID
  const getMarkAndUid = (selectedMark) => {
    const parts = [];
    if (selectedMark) {
      parts.push(selectedMark);
    }
    if (userId) {
      parts.push(`:${userId}`);
    }
    return parts.join('');
  };

  // 获取完整地址（包含唛头+UID中文）
  const getFullAddressWithMark = (item, selectedMark) => {
    const baseAddress = getBaseAddress(item);
    const markAndUid = getMarkAndUidChinese(selectedMark);
    return markAndUid ? `${baseAddress} ${markAndUid}` : baseAddress;
  };

  // 一键复制完整地址
  const handleCopyFullAddress = (item, e) => {
    e?.stopPropagation();
    const selectedMark = selectedMarkByWarehouse[item.shop_id] || '';
    const fullAddressWithMark = getFullAddressWithMark(item, selectedMark);
    const markAndUid = getMarkAndUid(selectedMark);

    let text = `${t("storage.detail.recipient", "收件人")}: ${item.linkman}
${t("storage.detail.phone", "电话")}: ${item.phone}
${t("storage.detail.address", "地址")}: ${fullAddressWithMark}`;

    if (item.post) {
      text += `\n${t("storage.detail.zip", "邮编")}: ${item.post}`;
    }

    if (markAndUid) {
      text += `\n${t("storage.detail.mark_uid", "唛头/会员号")}: ${markAndUid}`;
    }

    handleCopy(text, e);
  };

  const markOptions = userMarks.map((m) => ({
    value: m.mark,
    label: m.mark,
    data: m,
  }));

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm sticky top-0 z-20 transition-all duration-200">
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">{t("storage.title")}</h1>
        </div>
      </div>

      <div className="p-4 space-y-5 max-w-xl mx-auto">
        {loading && list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : list.length > 0 ? (
          list.map((item, index) => {
            const selectedMark = selectedMarkByWarehouse[item.shop_id] || '';
            const fullAddressWithMark = getFullAddressWithMark(item, selectedMark);
            const markAndUid = getMarkAndUid(selectedMark);

            return (
              <div
                key={item.shop_id}
                className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/80"
              >
                {/* Header - Warehouse Name */}
                <div
                  onClick={() => handleItemClick(item.shop_id)}
                  className="px-5 py-4 cursor-pointer group hover:bg-slate-50 transition-colors border-b border-slate-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                      <WarehouseIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                        {item.shop_name || t("storage.unknown_warehouse")}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">Click for details</p>
                    </div>
                  </div>
                  <div className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
                    <ChevronRightIcon className="w-5 h-5" />
                  </div>
                </div>

                {/* Details Section */}
                <div className="px-5 pt-4 pb-5 space-y-4" onClick={(e) => e.stopPropagation()}>

                  {/* Mark Selector */}
                  {userMarks.length > 1 && (
                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {t("storage.detail.select_mark", "Mark")}
                        </label>
                      </div>
                      <Dropdown
                        value={selectedMark}
                        options={markOptions}
                        onChange={(value) => handleMarkChange(item.shop_id, value)}
                        open={openDropdownId === item.shop_id}
                        onToggle={() => setOpenDropdownId(
                          openDropdownId === item.shop_id ? null : item.shop_id
                        )}
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Address Fields */}
                  <div className="space-y-2.5">
                    <AddressRow
                      label={t("storage.detail.recipient", "收件人")}
                      value={item.linkman}
                      onCopy={(e) => handleCopy(item.linkman, e)}
                      t={t}
                    />
                    <AddressRow
                      label={t("storage.detail.phone", "电话")}
                      value={item.phone}
                      onCopy={(e) => handleCopy(item.phone, e)}
                      t={t}
                    />

                    <AddressRow
                      label={t("storage.detail.address", "地址")}
                      value={fullAddressWithMark}
                      onCopy={(e) => handleCopy(fullAddressWithMark, e)}
                      t={t}
                      highlight={true}
                      icon="map"
                    />

                    {item.post && (
                      <AddressRow
                        label={t("storage.detail.zip", "邮编")}
                        value={item.post}
                        onCopy={(e) => handleCopy(item.post, e)}
                        t={t}
                      />
                    )}

                    {markAndUid && (
                      <AddressRow
                        label={t("storage.detail.mark_uid", "唛头/会员号")}
                        value={markAndUid}
                        onCopy={(e) => handleCopy(markAndUid, e)}
                        t={t}
                        highlight={true}
                        icon="user"
                      />
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => handleCopyFullAddress(item, e)}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <CopyIcon className="w-4 h-4" />
                    {t("mark.copy_full_address", "复制完整地址")}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <WarehouseIcon className="w-8 h-8" />
            </div>
            <p className="font-medium text-slate-500">{t("common.no_data")}</p>
          </div>
        )}
      </div>
      <Tab />
    </div>
  );
};

// AddressRow component
const AddressRow = ({ label, value, onCopy, t, highlight = false, icon }) => {
  const Icon = icon === 'map' ? MapIcon : icon === 'user' ? UserIcon : null;

  return (
    <div
      className={classNames(
        "flex items-start justify-between rounded-xl p-3 transition-colors duration-200",
        {
          'bg-indigo-50/60 border border-indigo-100/50': highlight,
          'bg-slate-50 border border-transparent': !highlight
        }
      )}
    >
      <div className="flex-1 min-w-0 mr-3 flex gap-3">
        {Icon && (
          <div className={classNames(
            "mt-0.5",
            highlight ? "text-indigo-500" : "text-slate-400"
          )}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className={classNames(
            "text-[11px] font-bold uppercase tracking-wider block mb-1",
            {
              'text-indigo-400': highlight,
              'text-slate-400': !highlight
            }
          )}>
            {label}
          </span>
          <div className={classNames(
            "text-sm font-medium break-all leading-relaxed",
            {
              'text-indigo-900': highlight,
              'text-slate-700': !highlight
            }
          )}>
            {value || "-"}
          </div>
        </div>
      </div>

      <button
        onClick={onCopy}
        className={classNames(
          "flex-shrink-0 p-2 rounded-lg transition-all active:scale-95",
          {
            'bg-indigo-100 text-indigo-600 hover:bg-indigo-200': highlight,
            'bg-white text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 shadow-sm border border-slate-100': !highlight
          }
        )}
        title={t("common.copy", "复制")}
      >
        <CopyIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default StoragePage;
