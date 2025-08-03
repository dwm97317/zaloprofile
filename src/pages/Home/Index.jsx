import React, { useEffect, useState } from "react";
import { Page, useNavigate, Box, Swiper } from "zmp-ui";
import { useSetRecoilState } from "recoil";
import {
  guideTypeState,
  lineIdState,
  reportFormState,
  orderStatusState,
  reportFormTypeState,
} from "../../state";
import Tab from "../../components/Tab/Tab";
import request from "../../utils/request";
import util from "../../utils/util";
import copy from "copy-to-clipboard";
import "./Index.scss";

const HomePage = () => {
  const setGuideId = useSetRecoilState(guideTypeState);
  const setOrderStatus = useSetRecoilState(orderStatusState);
  const setLineId = useSetRecoilState(lineIdState);
  const setFormReportData = useSetRecoilState(reportFormState);
  const setFormReportType = useSetRecoilState(reportFormTypeState);

  const navigate = useNavigate();
  let [bestLine, setBestLine] = useState([]);
  let [course, setCourse] = useState([]);
  const [service, setService] = useState([]);
  const [comment, setComment] = useState([]);

  const handleClick = (e) => {
    copy(e.target.dataset.text);
    showToast({
      message: "Sao chép thành công",
    });
  };

  const navData = [
    {
      id: 0,
      name: "Dự báo gói hàng",
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img2.png",
      url: "/package/report",
    },
    {
      id: 1,
      name: "Gói hàng của tôi",
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img3.png",
      url: "/order/package",
    },
    {
      id: 2,
      name: "Yêu cầu đóng gói",
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img4.png",
      url: "/package/pack",
    },
    {
      id: 3,
      name: "Chờ thanh toán",
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img5.png",
      url: "/order/Index",
      params: 2,
    },
    {
      id: 4,
      name: "Nhận gói hàng",
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img6.png",
      url: "/package/take",
    },
    {
      id: 5,
      name: "Danh sách kho",
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img7.png",
      url: "/storage/index",
    },
    {
      id: 6,
      name: "Tính cước vận chuyển",
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img8.png",
      url: "/freight",
    },
    {
      id: 7,
      name: "Hướng dẫn thao tác",
      img: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img9.png",
      url: "/article/help/order",
    },
  ];

  const toDetail = (e, params) => {
    if (params) {
      setLineId(params);
    }
    navigate(e);
  };

  const menuTarget = (e, params) => {
    if (params) {
      setOrderStatus(params);
    }
    navigate(e);
  };

  // Lấy bình luận
  const getComment = () => {
    request.get("comment/hotComment&wxapp_id=10001").then((res) => {
      let _comment = res.data;
      setComment(_comment);
    });
  };

  const goHelper = (e, type) => {
    setGuideId(type);
    navigate(e);
  };

  // Lấy tuyến đường tốt nhất
  const getBestLine = () => {
    request.get("page/goods_line&wxapp_id=10001").then((res) => {
      bestLine = res.data;
      setBestLine(bestLine);
    });
  };
  // Lấy khóa học
  const getCourse = () => {
    request.get("page/banner&wxapp_id=10001").then((res) => {
      course = res.data;
      setCourse(course);
    });
  };
  // Lấy danh sách dịch vụ khách hàng
  const getServiceList = () => {
    request.get("page/service&wxapp_id=10001").then((res) => {
      console.log(res, "res");
      let serviceList = res.data.values;
      console.log(serviceList, "s-list");
    });
  };

  useEffect(() => {
    getBestLine();
    getCourse();
    setFormReportData("");
    setFormReportType("normal");
    getServiceList();
    getComment();
    util.setBarPageView("Trang chủ");
    return () => {};
  }, []);
  return (
    <Page className="page">
      <div className="container">
        <div className="header">
          <div className="banner">
            <Box
              flex
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Swiper className="no-border-radius">
                {course.map((item, index) => {
                  return (
                    <Swiper.Slide key={index}>
                      <img
                        className="slide-img"
                        src={item["image"]["file_path"]}
                        alt="slide-1"
                      />
                    </Swiper.Slide>
                  );
                })}
              </Swiper>
            </Box>
          </div>
        </div>
        <div className="menu">
          {navData.map((item, key) => {
            return (
              <div
                className="menu-item"
                key={key}
                onClick={(e) => {
                  menuTarget(item["url"], item["params"]);
                }}
              >
                <div className="menu-icon">
                  <img src={item["img"]} />
                </div>
                <div className="menu-text">{item["name"]}</div>
              </div>
            );
          })}
        </div>
        <div className="helper">
          <div
            className="helper-item"
            onClick={(e) => goHelper("/article/help/order", "")}
          >
            <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img10.png" />
          </div>
          <div
            className="helper-item"
            onClick={(e) => goHelper("/article/help/list", "newUser")}
          >
            <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img11.png" />
          </div>
          <div
            className="helper-item"
            onClick={(e) => goHelper("/article/help/list", "ban")}
          >
            <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img12.png" />
          </div>
        </div>
      </div>
      <div className="container">
        <div className="container-label">
          <div className="container-label-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img14.png" />
          </div>
          Tuyến đường tốt nhất
        </div>
        <div className="container-content">
          {bestLine.map((item, key) => {
            const items = item.map((item1, index) => {
              return (
                <div
                  className="route-item"
                  key={index}
                  onClick={(e) => toDetail("/common/line/detail", item1.id)}
                >
                  <div className="route-img">
                    <img
                      src={
                        item1["image"]
                          ? item1["image"]
                          : "https://www.hrbmu.edu.cn/jwc/images/no_pic.png"
                      }
                    ></img>
                  </div>
                  <div className="route-content">
                    <div className="route-text">
                      {item1["name"]}-(Thời gian giao hàng-
                      {item1["limitationofdelivery"]})
                    </div>
                    <div className="route-text">
                      Thuế quan:
                      <span style={{ color: "#006cfe" }}>
                        {item1["tariff"]}
                      </span>
                    </div>
                    <div className="route-text">Nhấn để xem chi tiết</div>
                  </div>
                </div>
              );
            });
            return (
              <Swiper className="swiper-content" key={key}>
                <Swiper.Slide>
                  <div className="route-container">{items}</div>
                </Swiper.Slide>
              </Swiper>
            );
          })}
        </div>
      </div>
      <div className="container">
        <div className="container-label">
          <div className="container-label-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img16.png" />
          </div>
          Bình luận nổi bật
          <div
            className="view-more"
            onClick={(e) => goHelper("/common/comment")}
          >
            Xem thêm
          </div>
        </div>
        <div className="container-content">
          <Swiper className="swiper-content">
            {comment.map((item, key) => {
              return (
                <Swiper.Slide key={key}>
                  <div className="route-container">
                    <div className="comment-item">
                      <div className="comment-avatar">
                        <img
                          src={
                            item.user
                              ? item.user.avatarUrl
                              : "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img19.png"
                          }
                        ></img>
                      </div>
                      <div className="comment-content">
                        <div className="comment-row">
                          <p className="username">
                            {item["user"] ? item["user"]["nickName"] : "Khách"}
                          </p>
                          <p>{item["create_time"]}</p>
                        </div>
                        <div className="comment-row">
                          <p>Mã đơn hàng:{item["order_sn"]}</p>
                          <p></p>
                        </div>
                        <div className="comment-row">
                          <div className="comment-content-1">
                            {item["content"]}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Swiper.Slide>
              );
            })}
          </Swiper>
        </div>
      </div>
      <div className="container" style={{ marginBottom: 80 + "px" }}>
        <div className="container-label">
          <div className="container-label-icon">
            <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img18.png" />
          </div>
          Dịch vụ khách hàng
        </div>
        <div className="container-content" style={{ marginTop: 10 + "px" }}>
          <div className="serivce-item">
            <div className="service-avatar">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img19.png" />
            </div>
            <div className="service-info">
              <div className="service-text">Dịch vụ Tập kết Si</div>
              <div className="service-text">Hotline:1928374585</div>
            </div>
            <div
              className="service-btn"
              onClick={(e) => {
                util.openPhone("18986586585");
              }}
            >
              <div className="service-btn-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img20.png" />
              </div>
              <div className="service-btn-text">Gọi hotline</div>
            </div>
          </div>
          <div className="serivce-item">
            <div className="service-avatar">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img19.png" />
            </div>
            <div className="service-info">
              <div className="service-text">Dịch vụ ZALO - Phùng</div>
              <div className="service-text">Hotline:1928374585</div>
            </div>
            <div
              className="service-btn"
              onClick={(e) => {
                util.openPhone("18986586585");
              }}
            >
              <div className="service-btn-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images//kefu.png" />
              </div>
              <div className="service-btn-text">CS trực tuyến</div>
            </div>
          </div>
          <div className="serivce-item">
            <div className="service-avatar">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img19.png" />
            </div>
            <div className="service-info">
              <div className="service-text">WeChat - Phùng</div>
              <div className="service-text">Hotline:1928374585</div>
            </div>
            <div
              className="service-btn"
              data-text="1859585858"
              onClick={(e) => {
                handleClick(e);
              }}
            >
              <div className="service-btn-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images//copy.png" />
              </div>
              <div className="service-btn-text">Sao chép WeChat</div>
            </div>
          </div>
          <div className="serivce-item">
            <div className="service-avatar">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img19.png" />
            </div>
            <div className="service-info">
              <div className="service-text">Email dịch vụ</div>
              <div className="service-text">Hotline:1928374585</div>
            </div>
            <div
              className="service-btn"
              data-text="1859585858"
              onClick={(e) => {
                handleClick(e);
              }}
            >
              <div className="service-btn-icon">
                <img src="https://zhuanyun.sllowly.cn/assets/api/images//copy.png" />
              </div>
              <div className="service-btn-text">Sao chép email</div>
            </div>
          </div>
        </div>
      </div>
      <Tab current="home" />
    </Page>
  );
};

export default HomePage;