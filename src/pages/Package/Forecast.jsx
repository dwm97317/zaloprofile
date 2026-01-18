import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import request from "../../utils/request";
import { toast } from "../../utils/toast.jsx";
import LineButton from "../../components/LineButton/Index";
import LineInput from "../../components/LineInput/Index";
import Tab from "../../components/Tab/Tab";
import "./Forecast.scss";

/**
 * 包裹预报页面 - LINE Theme
 * 支持单个和批量预报模式
 */

const ForecastPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [mode, setMode] = useState("single"); // 'single' | 'batch'
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  // 单个预报表单
  const [singleForm, setSingleForm] = useState({
    warehouse_id: "",
    tracking_number: "",
    mark: "",
  });

  // 批量预报表单
  const [batchForm, setBatchForm] = useState({
    warehouse_id: "",
    tracking_numbers: [],
  });
  const [currentInput, setCurrentInput] = useState("");

  // 获取仓库列表
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await request.get("storage/lists&wxapp_id=10001", null, { cache: true, ttl: 60000 });
        if (res.data && res.data.list) {
          setWarehouses(res.data.list);
        }
      } catch (error) {
        console.error("Failed to fetch warehouses:", error);
        toast.error(t("forecast.warehouse_load_error", "โหลดรายการคลังสินค้าล้มเหลว"));
      }
    };

    fetchWarehouses();
  }, [t]);

  /**
   * 提交单个预报
   */
  const handleSingleSubmit = async (e) => {
    e.preventDefault();

    // 验证
    if (!singleForm.warehouse_id) {
      toast.error(t("forecast.select_warehouse", "กรุณาเลือกคลังสินค้า"));
      return;
    }
    if (!singleForm.tracking_number.trim()) {
      toast.error(t("forecast.enter_tracking", "กรุณากรอกหมายเลขพัสดุ"));
      return;
    }

    setLoading(true);
    try {
      const res = await request.post("package/add&wxapp_id=10001", {
        storage_id: singleForm.warehouse_id,
        express_no: singleForm.tracking_number.trim(),
        mark: singleForm.mark.trim() || undefined,
      });

      if (res.code === 1) {
        toast.success(t("forecast.success", "แจ้งพัสดุสำเร็จ"));
        // 重置表单
        setSingleForm({
          warehouse_id: singleForm.warehouse_id,
          tracking_number: "",
          mark: "",
        });
        // 延迟跳转
        setTimeout(() => navigate("/order/package"), 1500);
      } else {
        toast.error(res.msg || t("forecast.failed", "แจ้งพัสดุล้มเหลว"));
      }
    } catch (error) {
      console.error("Single forecast error:", error);
      toast.error(t("forecast.failed", "แจ้งพัสดุล้มเหลว"));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 添加快递单号到批量列表
   */
  const handleAddTracking = () => {
    const trimmed = currentInput.trim();
    if (!trimmed) {
      toast.error(t("forecast.enter_tracking", "กรุณากรอกหมายเลขพัสดุ"));
      return;
    }

    if (batchForm.tracking_numbers.includes(trimmed)) {
      toast.error(t("forecast.duplicate_tracking", "หมายเลขพัสดุซ้ำ"));
      return;
    }

    setBatchForm({
      ...batchForm,
      tracking_numbers: [...batchForm.tracking_numbers, trimmed],
    });
    setCurrentInput("");
  };

  /**
   * 删除快递单号
   */
  const handleRemoveTracking = (index) => {
    setBatchForm({
      ...batchForm,
      tracking_numbers: batchForm.tracking_numbers.filter((_, i) => i !== index),
    });
  };

  /**
   * 提交批量预报
   */
  const handleBatchSubmit = async (e) => {
    e.preventDefault();

    // 验证
    if (!batchForm.warehouse_id) {
      toast.error(t("forecast.select_warehouse", "กรุณาเลือกคลังสินค้า"));
      return;
    }
    if (batchForm.tracking_numbers.length === 0) {
      toast.error(t("forecast.add_tracking_first", "กรุณาเพิ่มหมายเลขพัสดุอย่างน้อย 1 รายการ"));
      return;
    }

    setLoading(true);
    try {
      // 批量提交
      const promises = batchForm.tracking_numbers.map((trackingNo) =>
        request.post("package/add&wxapp_id=10001", {
          storage_id: batchForm.warehouse_id,
          express_no: trackingNo,
        })
      );

      const results = await Promise.allSettled(promises);

      const successCount = results.filter((r) => r.status === "fulfilled" && r.value.code === 1).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(
          t("forecast.batch_success", `แจ้งพัสดุสำเร็จ ${successCount} รายการ${failCount > 0 ? `, ล้มเหลว ${failCount} รายการ` : ""}`)
        );

        // 重置表单
        setBatchForm({
          warehouse_id: batchForm.warehouse_id,
          tracking_numbers: [],
        });

        // 延迟跳转
        setTimeout(() => navigate("/order/package"), 1500);
      } else {
        toast.error(t("forecast.batch_failed", "แจ้งพัสดุล้มเหลวทั้งหมด"));
      }
    } catch (error) {
      console.error("Batch forecast error:", error);
      toast.error(t("forecast.failed", "แจ้งพัสดุล้มเหลว"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forecast-page pb-24">
      {/* Header */}
      <div className="forecast-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="header-title">{t("forecast.title", "แจ้งพัสดุ")}</h1>
        <div className="w-6"></div>
      </div>

      {/* Mode Selector */}
      <div className="mode-selector">
        <button
          onClick={() => setMode("single")}
          className={`mode-btn ${mode === "single" ? "active" : ""}`}
        >
          {t("forecast.single_mode", "พัสดุเดี่ยว")}
        </button>
        <button
          onClick={() => setMode("batch")}
          className={`mode-btn ${mode === "batch" ? "active" : ""}`}
        >
          {t("forecast.batch_mode", "พัสดุหลายรายการ")}
        </button>
      </div>

      {/* Single Mode Form */}
      {mode === "single" && (
        <form onSubmit={handleSingleSubmit} className="forecast-form">
          {/* Warehouse Selection */}
          <div className="form-group">
            <label className="form-label">
              {t("forecast.warehouse", "คลังสินค้า")} <span className="required">*</span>
            </label>
            <select
              value={singleForm.warehouse_id}
              onChange={(e) => setSingleForm({ ...singleForm, warehouse_id: e.target.value })}
              className="form-select"
              disabled={loading}
            >
              <option value="">{t("forecast.select_warehouse", "เลือกคลังสินค้า")}</option>
              {warehouses.map((w) => (
                <option key={w.storage_id} value={w.storage_id}>
                  {w.shop_name}
                </option>
              ))}
            </select>
          </div>

          {/* Tracking Number */}
          <div className="form-group">
            <LineInput
              label={t("forecast.tracking_number", "หมายเลขพัสดุ")}
              required
              placeholder={t("forecast.enter_tracking", "กรอกหมายเลขพัสดุ")}
              value={singleForm.tracking_number}
              onChange={(val) => setSingleForm({ ...singleForm, tracking_number: val })}
            />
          </div>

          {/* Mark (Optional) */}
          <div className="form-group">
            <LineInput
              label={t("forecast.mark", "เครื่องหมาย (ไม่บังคับ)")}
              placeholder={t("forecast.enter_mark", "กรอกเครื่องหมายพัสดุ")}
              value={singleForm.mark}
              onChange={(val) => setSingleForm({ ...singleForm, mark: val })}
            />
          </div>

          {/* Submit Button */}
          <LineButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {t("forecast.submit", "ยืนยันการแจ้งพัสดุ")}
          </LineButton>
        </form>
      )}

      {/* Batch Mode Form */}
      {mode === "batch" && (
        <form onSubmit={handleBatchSubmit} className="forecast-form">
          {/* Warehouse Selection */}
          <div className="form-group">
            <label className="form-label">
              {t("forecast.warehouse", "คลังสินค้า")} <span className="required">*</span>
            </label>
            <select
              value={batchForm.warehouse_id}
              onChange={(e) => setBatchForm({ ...batchForm, warehouse_id: e.target.value })}
              className="form-select"
              disabled={loading}
            >
              <option value="">{t("forecast.select_warehouse", "เลือกคลังสินค้า")}</option>
              {warehouses.map((w) => (
                <option key={w.storage_id} value={w.storage_id}>
                  {w.shop_name}
                </option>
              ))}
            </select>
          </div>

          {/* Tracking Number Input with Add Button */}
          <div className="form-group">
            <label className="form-label">
              {t("forecast.tracking_number", "หมายเลขพัสดุ")} <span className="required">*</span>
            </label>
            <div className="input-with-button">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTracking();
                  }
                }}
                placeholder={t("forecast.enter_tracking", "กรอกหมายเลขพัสดุ")}
                className="batch-input"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleAddTracking}
                className="add-btn"
                disabled={loading}
              >
                +
              </button>
            </div>
          </div>

          {/* Tracking Numbers List */}
          {batchForm.tracking_numbers.length > 0 && (
            <div className="tracking-list">
              <div className="list-header">
                {t("forecast.tracking_list", "รายการพัสดุ")} ({batchForm.tracking_numbers.length})
              </div>
              {batchForm.tracking_numbers.map((num, idx) => (
                <div key={idx} className="tracking-item">
                  <span className="tracking-number">{num}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTracking(idx)}
                    className="remove-btn"
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <LineButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading || batchForm.tracking_numbers.length === 0}
          >
            {t("forecast.submit_batch", `ยืนยันการแจ้งพัสดุ (${batchForm.tracking_numbers.length} รายการ)`)}
          </LineButton>
        </form>
      )}
      <Tab />
    </div>
  );
};

export default ForecastPage;
