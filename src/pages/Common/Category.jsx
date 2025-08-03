import React, { useEffect, useState } from "react";
import { Page, useNavigate, Button } from "zmp-ui";
import { useSetRecoilState } from "recoil";
import { categoryState, userState } from "../../state";
import request from "../../utils/request";
import Header from "../../components/Header/Header";
import "./Index.scss";

const CategoryPage = () => {
  const setCategoryData = useSetRecoilState(categoryState);
  const navigate = useNavigate();
  const [category, setCategory] = useState([]);
  
  // Lấy danh sách danh mục
  const getCategoryList = () => {
    const url = "/package/category";
    request.get(url + "&wxapp_id=10001").then((res) => {
      const detail = res.data;
      setCategory(detail);
    });
  };

  // Sự kiện chọn
  const setSelect = (item, index, pindex) => {
    item["is_select"] = item["is_select"] == true ? false : true;
    category[pindex]["child"][index] = item;
    setCategory([...category]);
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
    console.log("Mô phỏng componentDidMount lần render đầu tiên");
    getCategoryList();
    return () => {
      console.log("Mô phỏng componentWillUnmount sau khi hủy");
    };
  }, []);
  
  return (
    <Page className="page common">
      <Header></Header>
      {category.map((item, pindex) => {
        let itemList = item["child"].map((item1, index) => {
          return (
            <div
              key={index}
              className={`category-sub-item  ${
                item1["is_select"] == true ? "active" : ""
              }`}
              onClick={(e) => setSelect(item1, index, pindex)}
            >
              {item1["name"]}
            </div>
          );
        });
        return (
          <div className="category-item" key={pindex}>
            <div className="category-title">{item["name"]}</div>
            <div className="category-sub">{itemList}</div>
          </div>
        );
      })}
      <div className="button category-button">
        <Button className="button-reset">Đặt lại</Button>
        <Button onClick={(e) => handleConfirm()}>Xác nhận</Button>
      </div>
    </Page>
  );
};
export default CategoryPage;
