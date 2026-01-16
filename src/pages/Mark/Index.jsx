import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import request from "../../utils/request";
import util from "../../utils/util";
import { toast } from "../../utils/toast";
import Header from "../../components/Header/Header";
import AddressCopyCard from "../../components/Mark/AddressCopyCard";

const MarkPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [marks, setMarks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedMark, setSelectedMark] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    util.setBarPageView("My Marks");
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 并行获取唛头和仓库数据
      const [userRes, warehouseRes] = await Promise.all([
        request.post("user/detail&wxapp_id=10001"),
        request.get("page/storageList&wxapp_id=10001"),
      ]);

      // 处理唛头数据和 UID
      if (userRes.code === 1 && userRes.data?.userInfo) {
        const u = userRes.data.userInfo;
        const userMarks = u.usermark || [];
        const uid = String(u.uid || u.id || '');
        
        setMarks(userMarks);
        setUserId(uid || localStorage.getItem("userId") || localStorage.getItem("lineUserId") || '');
        
        // 默认选中第一个唛头
        if (userMarks.length > 0) {
          setSelectedMark(userMarks[0].mark);
        }
      } else {
        // 如果 API 没有返回 UID，从 localStorage 获取
        const uid = localStorage.getItem("userId") || localStorage.getItem("lineUserId") || '';
        setUserId(uid);
      }

      // 处理仓库数据
      if (Array.isArray(warehouseRes.data)) {
        setWarehouses(warehouseRes.data);
      }
    } catch (err) {
      console.error(err);
      // 错误时也尝试获取 UID
      const uid = localStorage.getItem("userId") || localStorage.getItem("lineUserId") || '';
      setUserId(uid);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title={t("mark.title", "我的唛头")} />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <Header title={t("mark.title", "我的唛头")} />

      <div className="p-4 space-y-4">
        {/* 快速复制地址卡片 - 有唛头时显示 */}
        {marks.length > 0 && warehouses.length > 0 && (
          <AddressCopyCard
            marks={marks}
            warehouses={warehouses}
            selectedMark={selectedMark}
            selectedWarehouse={selectedWarehouse}
            onMarkChange={setSelectedMark}
            onWarehouseChange={setSelectedWarehouse}
            userId={userId}
          />
        )}

        {/* 分隔线 */}
        {marks.length > 0 && warehouses.length > 0 && (
          <div className="border-t border-gray-200 my-2"></div>
        )}

        {/* 唛头列表标题 */}
        {marks.length > 0 && (
          <h3 className="font-medium text-gray-700 px-1">
            {t("mark.my_marks_list", "我的唛头列表")}
          </h3>
        )}

        {/* 唛头列表 */}
        {marks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-4xl">🏷️</span>
            </div>
            <p className="text-gray-500">{t("mark.empty", "暂无唛头")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {marks.map((item, index) => (
              <div
                key={item.id || index}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 text-lg truncate">
                      {item.mark}
                    </div>
                    {item.markdes && (
                      <div className="text-sm text-gray-500 mt-1 truncate">
                        {item.markdes}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(item.mark)}
                    className="ml-3 px-4 py-2 bg-primary-500 text-white text-sm rounded-xl
                               active:scale-95 transition-transform flex-shrink-0"
                  >
                    {t("common.copy", "复制")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkPage;
