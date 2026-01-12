import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import request from "../../utils/request";
import util from "../../utils/util";
import Header from "../../components/Header/Header";
import Loading from "../../components/Loading/Index";

const CommonSmsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const getSmsList = async () => {
    try {
      const res = await request.get("user/smslist&wxapp_id=10001");
      if (res.data && res.data.data) {
        setList(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    util.setBarPageView("SMS List");
    getSmsList();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <Header title={t("common_page.sms_title", "Messages")} />

      <div className="p-4">
        {loading ? (
          <Loading is={true} />
        ) : list.length > 0 ? (
          <div className="space-y-3">
            {list.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800">
                        {item.title || t("common_page.sms_title", "System Message")}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.created_time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p>{t("common.no_data", "No messages")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommonSmsPage;
