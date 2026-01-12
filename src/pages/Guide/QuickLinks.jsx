import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const QuickLinks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const links = [
    {
      title: t("guide.quick_links.calculate_freight"),
      icon: "💰",
      url: "/freight",
      gradient: "from-teal-400 to-teal-600"
    },
    {
      title: t("guide.quick_links.my_packages"),
      icon: "📦",
      url: "/order/package",
      gradient: "from-blue-400 to-blue-600"
    },
    {
      title: t("guide.quick_links.recharge"),
      icon: "💳",
      url: "/mine/recharge",
      gradient: "from-orange-400 to-orange-600"
    }
  ];

  return (
    <div className="px-4 py-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        {t("guide.other_features")}
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {links.map((link, index) => (
          <button
            key={index}
            onClick={() => navigate(link.url)}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl
                     shadow-sm border border-gray-100
                     hover:shadow-md hover:scale-105 active:scale-95
                     transition-all duration-200"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.gradient}
                            flex items-center justify-center text-2xl shadow-lg`}>
              {link.icon}
            </div>
            <span className="text-xs font-bold text-gray-700 text-center leading-tight">
              {link.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickLinks;
