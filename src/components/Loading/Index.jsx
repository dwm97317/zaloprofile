import React from "react";
import { Spinner } from "zmp-ui";
import "./loading.scss";

// Khởi tạo component
const Init = () => {
  return "";
};

// Hiển thị hiệu ứng tải
const Show = (e) => {
  return (
    <div className="loading-layer">
      <div className="loading">
        <div className="loading-spinner">
          <Spinner visible={e.is} />
        </div>
        <div className="loading-text">{e.text ? e.text : "Đang tải"}</div>
      </div>
    </div>
  );
};

const Loading = (prpos) => {
  const { is, text } = prpos;
  return is ? <Show is={is} text={text} /> : <Init />;
};
export default Loading;