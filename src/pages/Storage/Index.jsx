import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { storageIdState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import { toast } from "../../utils/toast";
import Dropdown from "../../components/Common/Dropdown";

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

  useEffect(() => {
    util.setBarPageView("Storage List");
    fetchData();
  }, []);

  const fetchData = async () => {
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
      
      console.log('Fetched UID:', uid, 'Marks:', marks);
      
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
        {list.map((item, index) => {
          const selectedMark = selectedMarkByWarehouse[item.shop_id] || '';
          const baseAddress = getBaseAddress(item);
          const fullAddressWithMark = getFullAddressWithMark(item, selectedMark);
          const markAndUid = getMarkAndUid(selectedMark);

          return (
            <div
              key={item.shop_id || index}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              {/* 可点击区域 - 仓库名称 */}
              <div
                onClick={() => handleItemClick(item.shop_id)}
                className="px-4 pt-4 pb-2 active:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">
                    {item.shop_name || t("storage.unknown_warehouse")}
                  </h3>
                  <span className="text-blue-600 text-sm font-medium flex items-center">
                    {t("storage.view_detail", "详情")} →
                  </span>
                </div>
              </div>

              {/* 地址信息区域 */}
              <div 
                className="px-4 pb-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 唛头选择器（放在地址信息上方） */}
                {userMarks.length > 1 && (
                  <div className="mb-3 pb-3 border-b border-gray-100">
                    <div className="text-xs text-gray-400 mb-2">
                      {t("storage.detail.select_mark", "选择唛头")}
                    </div>
                    <div className="max-w-[180px]">
                      <Dropdown
                        label={t("mark.select_mark", "选择唛头")}
                        value={selectedMark}
                        options={markOptions}
                        onChange={(value) => handleMarkChange(item.shop_id, value)}
                        open={openDropdownId === item.shop_id}
                        onToggle={() => setOpenDropdownId(
                          openDropdownId === item.shop_id ? null : item.shop_id
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* 地址信息 - 可分段复制 */}
                <div className="space-y-2 mb-3">
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
                  {/* 地址行：包含唛头+UID中文 */}
                  <AddressRow
                    label={t("storage.detail.address", "地址")}
                    value={fullAddressWithMark}
                    onCopy={(e) => handleCopy(fullAddressWithMark, e)}
                    t={t}
                    highlight={true}
                  />
                  {item.post && (
                    <AddressRow
                      label={t("storage.detail.zip", "邮编")}
                      value={item.post}
                      onCopy={(e) => handleCopy(item.post, e)}
                      t={t}
                    />
                  )}
                  {/* 唛头/会员号行 */}
                  {markAndUid && (
                    <AddressRow
                      label={t("storage.detail.mark_uid", "唛头/会员号")}
                      value={markAndUid}
                      onCopy={(e) => handleCopy(markAndUid, e)}
                      t={t}
                      highlight={true}
                    />
                  )}
                </div>

                {/* 一键复制全部按钮 */}
                <button
                  onClick={(e) => handleCopyFullAddress(item, e)}
                  className="w-full py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl
                             active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {t("mark.copy_full_address", "复制完整地址")}
                </button>
              </div>
            </div>
          );
        })}

        {list.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            {t("common.loading")}
          </div>
        )}
      </div>
    </div>
  );
};

// 地址行组件 - 支持分段复制
const AddressRow = ({ label, value, onCopy, t, highlight = false }) => (
  <div className={`flex items-start justify-between rounded-lg px-3 py-2 ${highlight ? 'bg-primary-50' : 'bg-gray-50'}`}>
    <div className="flex-1 min-w-0 mr-2">
      <span className={`text-xs ${highlight ? 'text-primary-400' : 'text-gray-400'}`}>{label}:</span>
      <div className={`text-sm font-medium break-all ${highlight ? 'text-primary-700' : 'text-gray-700'}`}>{value || "-"}</div>
    </div>
    <button
      onClick={onCopy}
      className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
        highlight 
          ? 'text-primary-400 hover:text-primary-600 hover:bg-primary-100' 
          : 'text-gray-400 hover:text-primary-500 hover:bg-primary-50'
      }`}
      title={t("common.copy", "复制")}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    </button>
  </div>
);

export default StoragePage;
