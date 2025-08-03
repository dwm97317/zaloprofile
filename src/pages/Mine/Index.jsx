import React, { useEffect, useState } from "react";
import { Page, useNavigate, Text, Button, Modal, useLocation } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { orderStatusState, userState, guideTypeState } from "../../state";
import Tab from "../../components/Tab/Tab";
import Loading from "../../components/Loading/Index";
import request from "../../utils/request";
import util from "../../utils/util";
import "./Mine.scss";
import {
  followOA,
  getAccessToken,
  getStorage,
  login,
  setStorage,
  showToast,
} from "zmp-sdk";

const HomePage = () => {
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const setGuideId = useSetRecoilState(guideTypeState);
  const setUserState = useSetRecoilState(userState);
  const setOrderStatus = useSetRecoilState(orderStatusState);
  const [confirmVisable, setConfirmVisable] = useState(false);
  const [assets, setAsssets] = useState({
    balance: 0.0,
    coupon: 0,
    sms: 0,
    points: 0,
  });
  const [userInfo, setUserInfo] = useState({ isLogin: false });
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  let oaUserId = "";
  let oAflag = false;
  // Xử lý đăng nhập dịch vụ
  const doLogin = (access) => {
    request
      .post("passport/loginByZalo&wxapp_id=10001", {
        form: { accesstoken: access },
      })
      .then((res) => {
        console.log(res, "eee");
        setLoading(false);
        setLoadingText("");
        setConfirmVisable(true);
        if (res.code == 0) {
          console.log("error");
          showToast({
            message: res.msg,
          });
          return;
        }
        showToast({
          message: "Đăng nhập thành công",
        });
        setUserInfo({
          user_id: res.data.user_id,
          nickname: res.data.nickname,
          token: res.data.token,
          avatarUrl: res.data.avatarUrl,
          isLogin: true,
        });
        setUserState({ token: res.data.token });
        setStorage({
          data: {
            isLogin: true,
            nickname: res.data.nickname,
            avatarUrl: res.data.avatarUrl,
            token: res.data.token,
          },
        });
      })
      .fail((res) => {
        setLoading(false);
        setLoadingText("");
      });
  };
  // Xử lý đăng nhập
  const handleLogin = () => {
    login({
      success: (code) => {
        console.log(code, "code");
        getAccessToken({
          success: (accesstoken) => {
            setLoading(true);
            setLoadingText("Đang đăng nhập");
            console.log(accesstoken, "access");
            doLogin(accesstoken);
          },
        });
      },
      fail: (err) => {
        console.log(err, "err");
      },
    });
  };

  const getUserInfos = async () => {
    console.log("Lấy thông tin người dùng");
    const { isLogin, nickname, avatarUrl } = await getStorage({
      keys: ["isLogin", "nickname", "avatarUrl"],
    });
    let user = {
      isLogin: isLogin,
      nickname: nickname,
      avatarUrl: avatarUrl,
    };
    if (isLogin) {
      getUserData();
    }
    setUserInfo(user);
  };

  // 关注公众号
  const confirmFollowoA = async () => {
    try {
      await followOA({
        id: "140130397183308120",
      });
      console.log("Theo dõi thành công");
    } catch (error) {
      if (code === -201) {
        console.log("Người dùng đã từ chối theo dõi");
      } else {
        console.log("Lỗi khác");
      }
    }
  };

  const bindOaUserId = (userId) => {
    if (oaUserId && userId) {
      request
        .post("user/bindOa&wxapp_id=10001", {
          oa_user_id: oaUserId,
          user_id: userId,
        })
        .then((res) => {
          if (res.code == 1) {
            oaUserId = "";
          }
        });
    }
  };

  const getUserData = () => {
    request.post("user/detail&wxapp_id=10001").then((res) => {
      if (res.code == -1) {
        setStorage({
          data: {
            isLogin: false,
          },
        });
      } else {
        let assets = [];
        assets["balance"] = res.data.userInfo["balance"];
        assets["sms"] = res.data.userInfo["sms"];
        assets["coupon"] = res.data.userInfo["coupon"];
        assets["points"] = res.data.userInfo["points"];
        let userData = res.data.userInfo;
        bindOaUserId(res.data.userInfo["user_id"]);
        setUserData(userData);
        setAsssets(assets);
      }
    });
  };

  // Khởi tạo trang cá nhân
  const initMine = () => {
    getUserInfos();
  };
  const goHelper = (e, type) => {
    setGuideId(type);
    navigate(e);
  };
  const targetTo = (e, route) => {
    navigate(route);
  };

  // Chuyển hướng đơn hàng
  const orderTargetTo = (e) => {
    const statusMap = {
      "no-check": 1,
      "no-pay": 2,
      "no-send": 3,
      "no-recive": 4,
      complete: 5,
    };
    setOrderStatus(statusMap[e]);
    navigate("/order/index");
  };

  // 使用 useLocation 钩子获取 URL 参数
  const location = useLocation();
  const queryParams = location.search || "";
  if (queryParams) {
    const queryParamsArr = util.parseQuery(queryParams);
    oaUserId = queryParamsArr["oa_user_id"];
  }
  useEffect(() => {
    initMine();
    return () => {};
  }, []);
  return (
    <Page className="page mine">
      <div className="header-mine">
        <div className="header-bg">
          <img src="https://zhuanyun.sllowly.cn/assets/api/images//dzx_img93.png"></img>
        </div>
        <div className="header-user">
          <div className="header-user-left">
            <div className="header-user-avatar">
              {userInfo.isLogin ? (
                <img src={userInfo.avatarUrl} />
              ) : (
                <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img19.png" />
              )}
            </div>
            {userInfo["isLogin"] ? (
              <div className="header-user-text-no-login">
                <Text size="xLarge">
                  Mã：{userData["user_code"] || userData["user_id"]}
                </Text>
                <Text size="xLarge">
                  {userInfo["isLogin"]
                    ? userInfo["nickname"]
                    : "Vui lòng đăng nhập"}
                </Text>
              </div>
            ) : (
              <div className="header-user-text-no-login">
                <Text size="xLarge">
                  {userInfo["isLogin"]
                    ? userInfo["nickname"]
                    : "Vui lòng đăng nhập"}
                </Text>
              </div>
            )}
          </div>
          <div className="header-user-right">
            {userInfo.isLogin ? (
              ""
            ) : (
              <Button className="loginBtn" onClick={() => handleLogin()}>
                Đăng nhập ngay
              </Button>
            )}
          </div>
        </div>
        {userInfo.isLogin ? (
          <div className="user-static">
            <div
              className="static-item"
              onClick={(e) => targetTo(e, "/mine/balance")}
            >
              <div className="static-num">{assets["balance"]}</div>
              <div className="static-text">Số dư</div>
            </div>
            <div
              className="static-item"
              onClick={(e) => targetTo(e, "/common/sms")}
            >
              <div className="static-num">{assets["sms"]}</div>
              <div className="static-text">Tin nhắn</div>
            </div>
            <div
              className="static-item"
              onClick={(e) => targetTo(e, "/common/coupon")}
            >
              <div className="static-num">{assets["coupon"]}</div>
              <div className="static-text">Mã giảm giá</div>
            </div>
            <div className="static-item" onClick={(e) => targetTo(e, "")}>
              <div className="static-num">{assets["points"]}</div>
              <div className="static-text">Tích điểm</div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="order-panle">
        <div className="panle-header">
          Đơn hàng của tôi
          <div
            className="more"
            onClick={(e) => {
              orderTargetTo("");
            }}
          >
            Xem tất cả đơn hàng
          </div>
        </div>
        <div className="order-panle-container">
          <div
            className="order-panle-item"
            onClick={(e) => {
              orderTargetTo("no-check");
            }}
          >
            <div className="order-panle-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img97.png" />
            </div>
            <div className="order-panle-text">Chờ kiểm tra</div>
          </div>
          <div
            className="order-panle-item"
            onClick={(e) => {
              orderTargetTo("no-pay");
            }}
          >
            <div className="order-panle-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img98.png" />
            </div>
            <div className="order-panle-text">Chờ thanh toán</div>
          </div>
          <div
            className="order-panle-item"
            onClick={(e) => {
              orderTargetTo("no-send");
            }}
          >
            <div className="order-panle-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img99.png" />
            </div>
            <div className="order-panle-text">Chờ gửi hàng</div>
          </div>
          <div
            className="order-panle-item"
            onClick={(e) => {
              orderTargetTo("no-recived");
            }}
          >
            <div className="order-panle-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img100.png" />
            </div>
            <div className="order-panle-text">Đã gửi hàng</div>
          </div>
          <div
            className="order-panle-item"
            onClick={(e) => {
              orderTargetTo("complete");
            }}
          >
            <div className="order-panle-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img101.png" />
            </div>
            <div className="order-panle-text">Hoàn thành</div>
          </div>
        </div>
      </div>
      <div
        className="order-panle"
        style={{ marginTop: 20 + "px", marginBottom: 80 + "px" }}
      >
        <div className="panle-header">Dịch vụ khác</div>
        <div className="order-panle-container">
          <div
            className="order-panle-item"
            onClick={(e) => targetTo(e, "/package/take")}
          >
            <div className="order-panle-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img114.png" />
            </div>
            <div className="order-panle-text">Nhận kiện hàng</div>
          </div>
          <div
            className="order-panle-item"
            onClick={(e) => targetTo(e, "/address/index")}
          >
            <div className="order-panle-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img115.png" />
            </div>
            <div className="order-panle-text">Địa chỉ nhận hàng</div>
          </div>
          <div
            className="order-panle-item"
            onClick={(e) => targetTo(e, "/storage/index")}
          >
            <div className="order-panle-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img116.png" />
            </div>
            <div className="order-panle-text">Địa chỉ kho hàng</div>
          </div>
          <div
            className="order-panle-item"
            onClick={(e) => goHelper("/article/help/list", "newUser")}
          >
            <div className="order-panle-icon">
              <img src="https://zhuanyun.sllowly.cn/assets/api/images/dzx_img117.png" />
            </div>
            <div className="order-panle-text">Câu hỏi mới</div>
          </div>
        </div>
      </div>
      <Loading is={loading} text={loadingText} />
      <Modal
        visible={confirmVisable}
        title="Thông báo"
        description="Để có trải nghiệm tốt hơn, vui lòng theo dõi tài khoản OA (Công ty TNHH thương mại Vũ Hương Trà) trước?"
        actions={[
          {
            text: "Hủy",
            onClick: () => {
              setConfirmVisable(false);
            },
            highLight: true,
          },
          {
            text: "Xác nhận",
            onClick: async () => {
              confirmFollowoA();
              setConfirmVisable(false);
            },
          },
        ]}
      />
      <Tab current="mine" />
    </Page>
  );
};

export default HomePage;
