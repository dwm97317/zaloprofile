import React, { useEffect, useState } from "react";
import { Page, Input, Button } from "zmp-ui";
import { useRecoilValue } from "recoil";
import { expressSnState } from "../../state";
import Tab from "../../components/Tab/Tab";
import "./Index.scss";
import request from "../../utils/request";
import Header from "../../components/Header/Header";
import util from "../../utils/util";

import { showToast } from "zmp-sdk";

const QueryPage = () => {
  const express = useRecoilValue(expressSnState);
  const [form, setForm] = useState({});
  const [list, setList] = useState([]);

  // Xử lý sự kiện nhập liệu
  const handleInput = (e) => {
    const field = e.target.dataset.field;
    form[field] = e.target.value;
    setForm(form);
  };

  // Gửi yêu cầu
  const handleSubmit = (e) => {
    if (form["code"] == "" || form["code"] == undefined) {
      showToast({
        message: "Vui lòng nhập mã vận đơn",
      });
      return;
    }
    request
      .post("/package/logicist&wxapp_id=10001", { ...form })
      .then((res) => {
        let list1 = res.data.logic;
        setList(list1);
      });
  };

  useEffect(() => {
    util.setBarPageView("Tra cứu");
    console.log(express, "express");
    if (express) {
      request
        .post("/package/logicist&wxapp_id=10001", { code: express })
        .then((res) => {
          let list1 = res.data.logic;
          setList(list1);
        });
    }
    return () => {};
  }, []);

  return (
    <Page className="page query">
      <Header></Header>
      <div className="form">
        <div className="form-group form-bg">
          <div className="form-label">
            <div className="form-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img27.png" />
            </div>
            Mã vận đơn
          </div>
          <div>
            <Input
              className="formInput"
              data-field="code"
              onInput={(e) => handleInput(e)}
              placeholder="Nhập mã vận đơn"
            />
          </div>
        </div>
        <div className="form-group">
          <Button
            className="submit-button"
            onClick={(e) => {
              handleSubmit();
            }}
          >
            Tra cứu ngay
          </Button>
        </div>
      </div>
      <div className="result-container">
        <div className="result-label">Kết quả tra cứu</div>
        <div className="result-content">
          {list.map((item, index) => {
            return index == 0 ? (
              <div className="result-item " key={index}>
                <div className="result-dot-current">
                  <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img66.png" />
                </div>
                <div className="result-content current">
                  <p>{item["logistics_describe"]}</p>
                  <p>{item["created_time"]}</p>
                </div>
              </div>
            ) : (
              <div className="result-item" key={index}>
                <div className="result-i-dot"></div>
                <div className="result-content">
                  <p>{item["logistics_describe"]}</p>
                  <p>{item["created_time"]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Tab current="query" />
    </Page>
  );
};
export default QueryPage;