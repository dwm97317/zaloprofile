import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { guideTypeState, guideIdState } from "../../../state";
import request from "../../../utils/request";
import util from "../../../utils/util";
import Header from "../../../components/Header/Header";
import Loading from "../../../components/Loading/Index";

const ListHelperPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const guideType = useRecoilValue(guideTypeState);
  const setGuideId = useSetRecoilState(guideIdState);

  const [helperlist, setHelperlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const getHelpList = async () => {
    // If guideType is missing, default to newUser or handle gracefully
    const type = guideType || "newUser";
    const url = type === "newUser" ? "page/problem" : "page/ban";

    try {
      const res = await request.get(url + "&wxapp_id=10001");
      if (res.data && res.data.data) {
        setHelperlist(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch help list", error);
    } finally {
      setLoading(false);
    }
  };

  const targetDetail = (id) => {
    setGuideId(id);
    navigate("/article/help/detail");
  };

  useEffect(() => {
    util.setBarPageView("Article List");
    getHelpList();
  }, [guideType]);

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <Header title={t("help.list_title")} />

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center text-gray-500 mt-10">{t("common.loading")}</div>
        ) : helperlist.length > 0 ? (
          helperlist.map((item, index) => (
            <div
              key={index}
              onClick={() => targetDetail(item.article_id)}
              className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between active:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  {/* Use a generic icon instead of the specific image if possible, or keep the image */}
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img172.png" className="w-6 h-6 object-contain" alt="" />
                </div>
                <div className="font-medium text-gray-800 line-clamp-2">
                  {item.article_title}
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>{t("common.no_data")}</p>
          </div>
        )}
      </div>

      <Loading is={loading} />
    </div>
  );
};

export default ListHelperPage;