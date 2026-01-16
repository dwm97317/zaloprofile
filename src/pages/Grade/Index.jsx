import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";
import { userGradeState, userExpendState, gradeListState } from "../../state";
import { GradeBadge } from "../../components/Grade";
import { getGradeStyle } from "../../utils/gradeUtils";
import "./Grade.scss";

const GradePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentGrade = useRecoilValue(userGradeState);
  const currentExpend = useRecoilValue(userExpendState);
  const gradeList = useRecoilValue(gradeListState);
  const [isAnimating, setIsAnimating] = useState(true);

  // 按权重排序等级列表
  const sortedGrades = [...gradeList].sort((a, b) => a.weight - b.weight);

  const isCurrentGrade = (grade) => {
    return currentGrade && grade.grade_id === currentGrade.grade_id;
  };

  const formatCurrency = (amount) => {
    return `¥${amount.toFixed(2)}`;
  };

  const formatDiscount = (discount) => {
    if (discount >= 10) return t("grade.no_discount", "无折扣");
    return `${discount}${t("grade.discount_suffix", "折")}`;
  };

  // 页面进入动画完成后
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`grade-page min-h-screen bg-gray-50 pb-6 ${isAnimating ? 'grade-page--animating' : ''}`}>
      {/* Header */}
      <div className="grade-page__header bg-gradient-to-r from-purple-600 to-indigo-600 pt-12 pb-8 px-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-white text-2xl hover:scale-110 transition-transform"
          >
            ←
          </button>
          <h1 className="text-white text-xl font-bold flex-1">
            {t("grade.grade_benefits")}
          </h1>
        </div>

        {/* Current Grade Display */}
        {currentGrade && (
          <div className="grade-page__current-card bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm mb-3">
                  {t("grade.current_grade", "当前等级")}
                </p>
                <GradeBadge grade={currentGrade} size="lg" showName={true} />
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm mb-1">
                  {t("grade.cumulative_spending")}
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(currentExpend)}
                </p>
              </div>
            </div>
            {currentGrade.equity?.discount < 10 && (
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <span className="text-sm">
                  {t("grade.current_discount", "当前享受")} {formatDiscount(currentGrade.equity.discount)} {t("grade.discount_benefit", "优惠")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grade List */}
      <div className="grade-page__list px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {sortedGrades.map((grade, index) => {
            const style = getGradeStyle(grade.weight);
            const isCurrent = isCurrentGrade(grade);
            const discount = grade.equity?.discount || 10;
            const requirement = grade.upgrade?.expend_money || 0;

            return (
              <div
                key={grade.grade_id}
                className={`grade-page__item ${isCurrent ? "grade-page__item--current" : ""}`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Grade Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <GradeBadge grade={grade} size="md" showName={false} />
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: style.color }}>
                        {grade.name}
                      </h3>
                      {isCurrent && (
                        <span className="text-xs text-white bg-gradient-to-r from-purple-500 to-indigo-500 px-2 py-0.5 rounded-full inline-block mt-1">
                          {t("grade.current_level", "当前等级")}
                        </span>
                      )}
                    </div>
                  </div>
                  {discount < 10 && (
                    <div className="text-right">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: style.color }}
                      >
                        {formatDiscount(discount)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {t("grade.discount_rate", "折扣率")}
                      </div>
                    </div>
                  )}
                </div>

                {/* Upgrade Condition */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {t("grade.upgrade_condition")}:
                    </span>
                    <span className="font-medium text-gray-800">
                      {requirement > 0
                        ? `${t("grade.cumulative_spending")} ${formatCurrency(requirement)}`
                        : t("grade.no_requirement", "无门槛")}
                    </span>
                  </div>
                </div>

                {/* Benefits */}
                {discount < 10 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      {t("grade.enjoy_discount", "享受全场")} {formatDiscount(discount)} {t("grade.discount_benefit", "优惠")}
                    </span>
                  </div>
                )}

                {/* Divider */}
                {index < sortedGrades.length - 1 && (
                  <div className="border-b border-gray-100 mt-4"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="px-4 mt-6">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 mb-2">
                {t("grade.tips_title", "温馨提示")}
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t("grade.tip1", "会员等级根据累计消费金额自动升级")}</li>
                <li>• {t("grade.tip2", "等级折扣适用于所有商品和服务")}</li>
                <li>• {t("grade.tip3", "等级权益长期有效，不会过期")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradePage;
