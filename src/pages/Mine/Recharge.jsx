import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import request from "../../utils/request";
import { toast } from "../../utils/toast.jsx";
import LineButton from "../../components/LineButton/Index";
import LineInput from "../../components/LineInput/Index";
import ImageUploader from "../../components/ImageUploader/Index";
import "./Recharge.scss";

/**
 * 转账充值页面 - LINE Theme
 * 支持日期、时间、金额输入和截图上传
 */

const RechargePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    transfer_date: "",
    transfer_time: "",
    amount: "",
    screenshots: [],
    remarks: "",
  });

  /**
   * 转换图片为 Base64
   */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * 表单验证
   */
  const validateForm = () => {
    if (!formData.transfer_date) {
      toast.error(t("recharge.select_date", "กรุณาเลือกวันที่โอนเงิน"));
      return false;
    }
    if (!formData.transfer_time) {
      toast.error(t("recharge.select_time", "กรุณาเลือกเวลาโอนเงิน"));
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error(t("recharge.enter_amount", "กรุณากรอกจำนวนเงิน"));
      return false;
    }
    if (formData.screenshots.length === 0) {
      toast.error(t("recharge.upload_screenshot", "กรุณาอัปโหลดหลักฐานการโอนเงิน"));
      return false;
    }
    return true;
  };

  /**
   * 提交表单
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // 转换所有图片为 Base64
      const base64Images = await Promise.all(
        formData.screenshots.map((item) => fileToBase64(item.file))
      );

      // 准备提交数据
      const submitData = {
        transfer_date: formData.transfer_date,
        transfer_time: formData.transfer_time,
        amount: parseFloat(formData.amount),
        screenshots: base64Images,
        remarks: formData.remarks || "",
      };

      // 调用充值 API
      const res = await request.post("recharge/apply&wxapp_id=10001", submitData);

      if (res.code === 1) {
        toast.success(t("recharge.success", "ส่งคำขอเติมเงินสำเร็จ"));
        // 重置表单
        setFormData({
          transfer_date: "",
          transfer_time: "",
          amount: "",
          screenshots: [],
          remarks: "",
        });
        // 延迟跳转
        setTimeout(() => navigate("/mine"), 1500);
      } else {
        toast.error(res.msg || t("recharge.failed", "ส่งคำขอเติมเงินล้มเหลว"));
      }
    } catch (error) {
      console.error("Recharge error:", error);
      toast.error(t("recharge.failed", "ส่งคำขอเติมเงินล้มเหลว"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recharge-page">
      {/* Header */}
      <div className="recharge-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="header-title">{t("recharge.title", "เติมเงิน")}</h1>
        <div className="w-6"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="recharge-form">
        {/* 转账日期 */}
        <div className="form-group">
          <LineInput
            label={t("recharge.transfer_date", "วันที่โอนเงิน")}
            required
            type="date"
            value={formData.transfer_date}
            onChange={(val) => setFormData({ ...formData, transfer_date: val })}
          />
        </div>

        {/* 转账时间 */}
        <div className="form-group">
          <LineInput
            label={t("recharge.transfer_time", "เวลาโอนเงิน")}
            required
            type="time"
            value={formData.transfer_time}
            onChange={(val) => setFormData({ ...formData, transfer_time: val })}
          />
        </div>

        {/* 金额 */}
        <div className="form-group">
          <LineInput
            label={t("recharge.amount", "จำนวนเงิน (฿)")}
            required
            type="number"
            placeholder="0.00"
            value={formData.amount}
            onChange={(val) => setFormData({ ...formData, amount: val })}
            prefix="฿"
          />
        </div>

        {/* 转账截图 */}
        <div className="form-group">
          <label className="form-label">
            {t("recharge.screenshots", "หลักฐานการโอนเงิน")} <span className="required">*</span>
          </label>
          <p className="form-hint">{t("recharge.screenshots_hint", "สูงสุด 3 รูป")}</p>
          <ImageUploader
            maxImages={3}
            value={formData.screenshots}
            onChange={(val) => setFormData({ ...formData, screenshots: val })}
            disabled={loading}
          />
        </div>

        {/* 备注 */}
        <div className="form-group">
          <label className="form-label">
            {t("recharge.remarks", "หมายเหตุ (ไม่บังคับ)")}
          </label>
          <textarea
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            rows={3}
            placeholder={t("recharge.remarks_placeholder", "กรอกหมายเหตุเพิ่มเติม")}
            className="form-textarea"
            disabled={loading}
          />
        </div>

        {/* 提交按钮 */}
        <LineButton
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          {t("recharge.submit", "ส่งคำขอเติมเงิน")}
        </LineButton>

        {/* 提示信息 */}
        <div className="info-box">
          <div className="info-icon">ℹ️</div>
          <div className="info-content">
            <h3 className="info-title">{t("recharge.info_title", "ข้อมูลสำคัญ")}</h3>
            <ul className="info-list">
              <li>{t("recharge.info_1", "กรุณาโอนเงินตามจำนวนที่ระบุ")}</li>
              <li>{t("recharge.info_2", "อัปโหลดหลักฐานการโอนเงินที่ชัดเจน")}</li>
              <li>{t("recharge.info_3", "ระบบจะตรวจสอบภายใน 24 ชั่วโมง")}</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RechargePage;
