import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";
import { storageIdState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import { toast } from "../../utils/toast";
import Button from "../../components/Button/Index";
import Loading from "../../components/Loading/Index";
import Dropdown from "../../components/Common/Dropdown";

const StorageDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const storageId = useRecoilValue(storageIdState);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userMarks, setUserMarks] = useState([]);
  const [userId, setUserId] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [showMarkDropdown, setShowMarkDropdown] = useState(false);

  useEffect(() => {
    util.setBarPageView("Warehouse Detail");
    if (storageId) {
      fetchDetail();
      fetchUserInfo();
    } else {
      navigate(-1);
    }
  }, [storageId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await request.get("page/storageDetails&wxapp_id=10001", { id: storageId });
      if (res.data) {
        setDetail(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const res = await request.post("user/detail&wxapp_id=10001");
      if (res.code === 1 && res.data?.userInfo) {
        const u = res.data.userInfo;
        const marks = u.usermark || [];
        const uid = String(u.uid || u.id || localStorage.getItem("userId") || '');
        
        setUserMarks(marks);
        setUserId(uid);
        // 有唛头用第一个唛头，无唛头用 UID
        setSelectedId(marks.length > 0 ? marks[0].mark : uid);
      }
    } catch (err) {
      console.error(err);
      const uid = localStorage.getItem("userId") || '';
      setUserId(uid);
      setSelectedId(uid);
    }
  };

  // 数字转中文
  const numberToChinese = (num) => {
    const chineseDigits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    return String(num).split('').map(d => chineseDigits[parseInt(d)] || d).join('');
  };

  // 获取格式化的唛头+UID（中文）- 格式：CODE:UID室
  const getFormattedMarkUidChinese = () => {
    if (!selectedId) return '';
    if (!userId) return selectedId;
    const chineseUid = numberToChinese(userId);
    return `${selectedId}:${chineseUid}室`;
  };

  // 获取格式化的唛头+UID（原始）- 格式：CODE:UID
  const getFormattedMarkUid = () => {
    if (!selectedId) return '';
    if (!userId) return selectedId;
    return `${selectedId}:${userId}`;
  };

  // 获取完整地址（包含唛头+UID中文）
  const getFullAddressWithMark = () => {
    if (!detail) return '';
    const markUidChinese = getFormattedMarkUidChinese();
    return markUidChinese ? `${detail.address} ${markUidChinese}` : detail.address;
  };

  const handleCopy = async (text) => {
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

  // 一键复制完整地址（格式化）
  const handleCopyFullAddress = () => {
    if (!detail) return;
    const fullAddress = getFullAddressWithMark();
    const markUid = getFormattedMarkUid();
    const text = `${t("storage.detail.recipient", "收件人")}: ${detail.linkman}
${t("storage.detail.phone", "电话")}: ${detail.phone}
${t("storage.detail.address", "地址")}: ${fullAddress}
${t("storage.detail.zip", "邮编")}: ${detail.post}
${t("storage.detail.mark_uid", "唛头/会员号")}: ${markUid}`;
    handleCopy(text);
  };

  // 一键复制（管道分隔格式，用于淘宝等平台）
  const handleCopyPipe = () => {
    if (!detail) return;
    const fullAddress = getFullAddressWithMark();
    const text = `${detail.linkman}|${detail.phone}|${fullAddress}|${detail.post}`;
    handleCopy(text);
  };

  // 唛头选项
  const markOptions = userMarks.map((m) => ({
    value: m.mark,
    label: m.mark,
    data: m,
  }));

  if (loading) return <Loading is={true} />;
  if (!detail) return <div className="p-4 text-center text-gray-400">{t("common.no_data")}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">{t("storage.detail.title")}</h1>
      </div>

      <div className="px-4 space-y-6">
        {/* Details Container */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
          {/* 唛头选择器 - 使用 Dropdown 组件 */}
          {userMarks.length > 0 && (
            <div className="pb-4 border-b border-gray-100">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {t("storage.detail.select_mark", "选择唛头")}
              </div>
              {userMarks.length === 1 ? (
                // 只有一个唛头时直接显示
                <div className="px-3 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium inline-block">
                  {userMarks[0].mark}
                </div>
              ) : (
                // 多个唛头时显示下拉选择器
                <div className="max-w-[200px]">
                  <Dropdown
                    label={t("mark.select_mark", "选择唛头")}
                    value={selectedId}
                    options={markOptions}
                    onChange={(value) => setSelectedId(value)}
                    open={showMarkDropdown}
                    onToggle={() => setShowMarkDropdown(!showMarkDropdown)}
                  />
                </div>
              )}
            </div>
          )}

          <InfoRow
            label={t("storage.detail.recipient")}
            value={detail.linkman}
            onCopy={() => handleCopy(detail.linkman)}
            t={t}
          />
          <InfoRow
            label={t("storage.detail.phone")}
            value={detail.phone}
            onCopy={() => handleCopy(detail.phone)}
            t={t}
          />
          <InfoRow
            label={t("storage.detail.address")}
            value={getFullAddressWithMark()}
            onCopy={() => handleCopy(getFullAddressWithMark())}
            t={t}
            highlight={true}
          />
          <InfoRow
            label={t("storage.detail.zip")}
            value={detail.post}
            onCopy={() => handleCopy(detail.post)}
            t={t}
          />
          {getFormattedMarkUid() && (
            <InfoRow
              label={t("storage.detail.mark_uid", "唛头/会员号")}
              value={getFormattedMarkUid()}
              onCopy={() => handleCopy(getFormattedMarkUid())}
              t={t}
              highlight={true}
            />
          )}

          {/* 一键复制按钮组 */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleCopyFullAddress}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white"
            >
              {t("mark.copy_full_address", "复制完整地址")}
            </Button>
            <Button
              onClick={handleCopyPipe}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200"
            >
              {t("storage.detail.copy_all", "复制地址（淘宝格式）")}
            </Button>
          </div>
        </div>

        {/* 地址预览卡片 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📋</span>
            <span className="font-medium text-gray-800">
              {t("mark.address_preview", "地址预览")}
            </span>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
            <div>
              <span className="text-gray-500">{t("storage.detail.recipient", "收件人")}:</span>{" "}
              <span className="text-gray-800 font-medium">{detail.linkman}</span>
            </div>
            <div>
              <span className="text-gray-500">{t("storage.detail.phone", "电话")}:</span>{" "}
              <span className="text-gray-800">{detail.phone}</span>
            </div>
            <div>
              <span className="text-gray-500">{t("storage.detail.address", "地址")}:</span>{" "}
              <span className="text-gray-800">{getFullAddressWithMark()}</span>
            </div>
            <div>
              <span className="text-gray-500">{t("storage.detail.zip", "邮编")}:</span>{" "}
              <span className="text-gray-800">{detail.post}</span>
            </div>
            {getFormattedMarkUid() && (
              <div>
                <span className="text-gray-500">{t("storage.detail.mark_uid", "唛头/会员号")}:</span>{" "}
                <span className="text-gray-800 font-medium">{getFormattedMarkUid()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Guide Container */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-100 p-2 rounded-xl">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img30.png" className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-gray-800 text-lg">{t("storage.guide.title")}</h2>
          </div>

          <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
            <GuideStep
              step={t("storage.guide.step1")}
              desc={t("storage.guide.desc1")}
            />
            <GuideStep
              step={t("storage.guide.step2")}
              desc={t("storage.guide.desc2")}
            />
            <GuideStep
              step={t("storage.guide.step3")}
              desc={t("storage.guide.desc3")}
            />
            <GuideStep
              step={t("storage.guide.step4")}
              desc={t("storage.guide.desc4")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, onCopy, t }) => (
  <div className="flex items-start justify-between group">
    <div className="flex-1 mr-4">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-gray-800 font-medium break-words leading-relaxed">{value || "-"}</div>
    </div>
    <button
      onClick={onCopy}
      className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center gap-1 font-medium whitespace-nowrap"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
      {t("storage.detail.copy")}
    </button>
  </div>
);

const GuideStep = ({ step, desc }) => (
  <div className="pl-8 relative">
    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-blue-100 border-4 border-white shadow-sm z-10"></div>
    <h3 className="font-bold text-gray-800 text-sm mb-1">{step}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">
      {desc}
    </p>
  </div>
);

export default StorageDetailPage;
