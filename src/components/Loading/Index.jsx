import React from "react";
import "./loading.scss";

// Simple spinner component using Tailwind CSS
const Spinner = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
};

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
        <div className="loading-text">{e.text ? e.text : "กำลังโหลด..."}</div>
      </div>
    </div>
  );
};

const Loading = (prpos) => {
  const { is, text } = prpos;
  return is ? <Show is={is} text={text} /> : <Init />;
};
export default Loading;