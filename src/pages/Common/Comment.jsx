import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import request from "../../utils/request";
import util from "../../utils/util";
import Header from "../../components/Header/Header";
import Loading from "../../components/Loading/Index";

const CommonCommentPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const getCommentList = async () => {
    try {
      const res = await request.get("comment/hotMoreComment&wxapp_id=10001");
      if (res.data && res.data.data) {
        setList(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    util.setBarPageView("Comment List");
    getCommentList();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <Header title={t("common_page.comment_title", "Comments")} />

      <div className="p-4 space-y-4">
        {loading ? (
          <Loading is={true} />
        ) : list.length > 0 ? (
          list.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start gap-3">
                <img
                  src={
                    item.user?.avatarUrl ||
                    "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img19.png"
                  }
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">
                      {item.user?.nickName || t("common.unknown", "Unknown")}
                    </span>
                    <span className="text-xs text-gray-400">
                      {item.create_time}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {t("order.labels.code", "Order Code")}: {item.order_sn}
                  </div>
                  <div className="text-gray-700 leading-relaxed">
                    {item.content}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>{t("common.no_data", "No comments yet")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommonCommentPage;
