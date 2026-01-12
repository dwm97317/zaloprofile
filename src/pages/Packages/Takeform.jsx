import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { categoryState, takeFormState } from "../../state";
import request from "../../utils/request";
import util from "../../utils/util";
import Button from "../../components/Button/Index";
import Loading from "../../components/Loading/Index";

const PackTakeFormPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Recoil states
  const [takeForm, setTakeForm] = useRecoilState(takeFormState);
  const [category, setCategory] = useRecoilState(categoryState);

  // Local form state
  const [expressSn, setExpressSn] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [classIds, setClassIds] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    util.setBarPageView("Take Form");

    // Initialize from takeForm state (pre-filled from previous page)
    if (takeForm && takeForm.express_sn) {
      setExpressSn(takeForm.express_sn);
    }

    // Check if returning from Category selection
    if (category && category.length > 0) {
      const names = category.map(c => c.name).join(",");
      const ids = category.map(c => c.category_id).join(",");
      setCategoryName(names);
      setClassIds(ids);

      // Clear category state after consuming it so it doesn't persist inappropriately
      // However, we might want to keep it if user navigates back and forth? 
      // For now, let's keep it until submit, but we need to be careful.
      // Actually, better to clear it to avoid stale data on new entry.
      // But if I clear it here, component re-renders. 
      // Let's just use it.
    }
  }, [category]); // Depend on category changes

  const handleSelectCategory = () => {
    // Save current input to takeForm state before navigating so we don't lose it
    setTakeForm(prev => ({ ...prev, express_sn: expressSn }));
    navigate("/common/select/category");
  };

  const handleSubmit = async () => {
    if (!expressSn) {
      alert(t("take.form.required_tracking"));
      return;
    }
    if (!classIds) {
      alert(t("take.form.required_category"));
      return;
    }

    setLoading(true);
    try {
      const res = await request.post("package/getTakePackage&wxapp_id=10001", {
        express_sn: expressSn,
        class_ids: classIds
      });

      if (res.code === 1) {
        alert(t("take.form.success"));
        // Clear state
        setTakeForm({});
        setCategory([]);
        navigate(-1); // Go back to list
      } else {
        alert(res.msg || t("common.error"));
      }
    } catch (err) {
      console.error(err);
      alert(t("common.error_network"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">{t("take.form_title")}</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Tracking Number Input */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img40.png" className="w-4 h-4" />
            </div>
            <label className="font-bold text-gray-700">{t("take.form.tracking_no")}</label>
          </div>
          <input
            type="text"
            className="w-full p-3 bg-gray-50 rounded-lg border-none text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            placeholder={t("take.form.enter_tracking")}
            value={expressSn}
            onChange={(e) => setExpressSn(e.target.value)}
          />
        </div>

        {/* Category Selection */}
        <div className="bg-white rounded-xl p-4 shadow-sm" onClick={handleSelectCategory}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img23.png" className="w-4 h-4" />
            </div>
            <label className="font-bold text-gray-700">{t("take.form.category")}</label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <span className={categoryName ? "text-gray-800 font-medium" : "text-gray-400"}>
              {categoryName || t("take.form.select_category")}
            </span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button onClick={handleSubmit} className="w-full rounded-xl py-3 text-lg font-bold shadow-blue-200">
            {t("take.form.confirm")}
          </Button>
        </div>
      </div>

      <Loading is={loading} />
    </div>
  );
};

export default PackTakeFormPage;