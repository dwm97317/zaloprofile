import React, { useEffect, useState } from "react";
import { Input, Page, useNavigate } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { countryState, userState } from "../../state";
import Header from "../../components/Header/Header";
import request from "../../utils/request";
import "./Index.scss";

const CountryPage = () => {
  const setCountryData = useSetRecoilState(countryState);
  const navigate = useNavigate();
  const [country, setCountry] = useState([]);
  // 获取线路详情
  const getCountryList = () => {
    const url = "/package/country";
    request.get(url + "&wxapp_id=10001").then((res) => {
      let detail = res.data;
      detail = convertJsonToArray(detail);
      setCountry(detail);
    });
  };

  const convertJsonToArray = (data) => {
    let arr = [];
    for (let i in data) {
      arr.push({
        key: i,
        data: data[i],
      });
    }
    return arr;
  };

  const handleSelect = (item) => {
    setCountryData(item);
    navigate(-1);
  };

  useEffect(() => {
    console.log("模拟componentDidMount第一次渲染");
    getCountryList();
    return () => {
      console.log("模拟componentWillUnmount执行销毁后");
    };
  }, []);
  return (
    <Page className="page common">
      <Header></Header>
      <div className="search-containner">
        <div className="search-input">
          <Input className="s-inp" placeholder="搜索" />
        </div>
      </div>
      <div className="country-containner">
        {country.map((item, index) => {
          let itemList = item["data"].map((item1, index) => {
            return (
              <p
                key={index}
                onClick={(e) => {
                  handleSelect(item1);
                }}
              >
                {item1["title"]}
              </p>
            );
          });
          return (
            <div className="country-item" key={index}>
              <div className="country-title">{item["key"]}</div>
              <div className="country-list">{itemList}</div>
            </div>
          );
        })}
      </div>
    </Page>
  );
};
export default CountryPage;
