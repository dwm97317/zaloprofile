import React from "react";
import { Box, useNavigate } from "zmp-ui";
import "./header.scss";

const Tab = (prpos) => {
  const navigate = useNavigate();
  const { current } = prpos;
  return (
    <Box flex className="header-bar">
      {/* <div className="headerBar">
          <div className="back-icon" onClick={()=>{navigate(-1)}}>
            <img src="https://zalonew.itaoth.com/assets/api/return.png" />
          </div>
       </div> */}
    </Box>
  );
};
export default Tab;
