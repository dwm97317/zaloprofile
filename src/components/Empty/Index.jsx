import React from "react";
import "./empty.scss";

const Empty = (prpos) => {
  return (
    <div className="empty">
      <div className="empty-icon">
        <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img43.png" />
      </div>
      <div className="empty-text">Không có dữ liệu</div>
    </div>
  );
};
export default Empty;