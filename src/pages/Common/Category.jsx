import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { categoryState } from "../../state";
import request from "../../utils/request";
import Header from "../../components/Header/Header";
import Button from "../../components/Button/Index";
import Loading from "../../components/Loading/Index";

const CategoryPage = () => {
  const { t } = useTranslation();
  const setCategoryData = useSetRecoilState(categoryState);
  const navigate = useNavigate();
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const getCategoryList = async () => {
    try {
      const res = await request.get("/package/category&wxapp_id=10001");
      if (res.data) {
        setCategory(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  const setSelect = (item, index, pindex) => {
    item["is_select"] = !item["is_select"];
    category[pindex]["child"][index] = item;
    setCategory([...category]);
  };

  const handleReset = () => {
    const resetCategory = category.map(parent => ({
      ...parent,
      child: parent.child.map(child => ({ ...child, is_select: false }))
    }));
    setCategory(resetCategory);
  };

  const handleConfirm = () => {
    let categorySelect = [];
    for (let i in category) {
      for (let ii in category[i]["child"]) {
        if (category[i]["child"][ii]["is_select"]) {
          categorySelect.push(category[i]["child"][ii]);
        }
      }
    }
    setCategoryData(categorySelect);
    navigate(-1);
  };

  useEffect(() => {
    getCategoryList();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <Header title={t("category.title", "Select Category")} />

      <div className="p-4 space-y-6">
        {loading ? (
          <Loading is={true} />
        ) : category.length > 0 ? (
          category.map((item, pindex) => (
            <div key={pindex} className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-base font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">
                {item["name"]}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {item["child"].map((item1, index) => (
                  <button
                    key={index}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      item1["is_select"]
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelect(item1, index, pindex)}
                  >
                    {item1["name"]}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 mt-20">
            {t("common.no_data", "No data available")}
          </div>
        )}
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3 safe-bottom">
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          {t("category.reset", "Reset")}
        </button>
        <Button
          onClick={handleConfirm}
          className="flex-1 rounded-lg shadow-md"
        >
          {t("category.confirm", "Confirm")}
        </Button>
      </div>
    </div>
  );
};

export default CategoryPage;
