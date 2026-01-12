import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";
import { guideIdState } from "../../../state";
import request from "../../../utils/request";
import util from "../../../utils/util";
import Header from "../../../components/Header/Header";
import Loading from "../../../components/Loading/Index";

const DetailHelperPage = () => {
  const { t } = useTranslation();
  const guideId = useRecoilValue(guideIdState);

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const getDetail = async () => {
    if (!guideId) return;
    try {
      const res = await request.get("Article/detail&wxapp_id=10001", { article_id: guideId });
      if (res.data && res.data.detail) {
        setDetail(res.data.detail);
      }
    } catch (error) {
      console.error("Failed to fetch article detail", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    util.setBarPageView("Article Detail");
    getDetail();
  }, [guideId]);

  return (
    <div className="min-h-screen bg-white pb-safe">
      <Header title={t("help.detail_title")} />

      {loading ? (
        <Loading is={true} />
      ) : detail ? (
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">{detail.article_title}</h1>
          <div className="text-sm text-gray-500 mb-6 flex items-center justify-between border-b border-gray-100 pb-2">
            <span>{detail.article_author || "System"}</span>
            <span>{detail.created_time}</span>
          </div>

          {/* Article Content */}
          <div
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg"
            dangerouslySetInnerHTML={{ __html: detail.article_content }}
          ></div>
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-20">{t("common.no_data")}</div>
      )}
    </div>
  );
};

export default DetailHelperPage;