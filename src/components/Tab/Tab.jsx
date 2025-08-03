import React from "react";
import { Box, useNavigate } from "zmp-ui";
import "./tab.scss";

const Tab = (prpos) => {
  const navigate = useNavigate();
  const { current } = prpos;
  const changeTab = (e, path) => {
    navigate(path);
  };
  return (
    <Box flex justifyContent="center" className="tab-bar">
      <div
        className={["tab-bar-item ", current == "home" ? "active" : ""].join(
          "",
        )}
        onClick={(e) => changeTab(e, "/")}
      >
        <div className="tab-bar-icon">
          <img
            src={
              current == "home"
                ? "https://zhuanyun.sllowly.cn/assets/api/images/dzx_imgs11.png"
                : "https://zhuanyun.sllowly.cn/assets/api/images/dzx_imgs1.png"
            }
          />
        </div>
        <div className="tab-bar-text">Trang chủ</div>
      </div>
      <div
        className={["tab-bar-item ", current == "query" ? "active" : ""].join(
          "",
        )}
        onClick={(e) => changeTab(e, "/query")}
      >
        <div className="tab-bar-icon">
          <img
            src={
              current == "query"
                ? "https://zhuanyun.sllowly.cn/assets/api/images/dzx_imgs22.png"
                : "https://zhuanyun.sllowly.cn/assets/api/images/dzx_imgs2.png"
            }
          />
        </div>
        <div className="tab-bar-text">Tra cứu</div>
      </div>
      <div className="tab-bar-item">
        <div className="center-bar">
          <img src="http://zalo.longxiaozhi.cn/assets/api/images/pub-1.png"></img>
        </div>
      </div>
      <div
        className={["tab-bar-item ", current == "freight" ? "active" : ""].join(
          "",
        )}
        onClick={(e) => changeTab(e, "/freight")}
      >
        <div className="tab-bar-icon">
          <img
            src={
              current == "freight"
                ? "https://zhuanyun.sllowly.cn/assets/api/images/dzx_imgs33.png"
                : "https://zhuanyun.sllowly.cn/assets/api/images/dzx_imgs3.png"
            }
          />
        </div>
        <div className="tab-bar-text">Cước phí</div>
      </div>
      <div
        className={["tab-bar-item ", current == "mine" ? "active" : ""].join(
          "",
        )}
        onClick={(e) => changeTab(e, "/mine")}
      >
        <div className="tab-bar-icon">
          <img
            src={
              current == "mine"
                ? "https://zhuanyun.sllowly.cn/assets/api/images/dzx_imgs44.png"
                : "https://zhuanyun.sllowly.cn/assets/api/images/dzx_imgs4.png"
            }
          />
        </div>
        <div className="tab-bar-text">Cá nhân</div>
      </div>
    </Box>
  );
};
export default Tab;