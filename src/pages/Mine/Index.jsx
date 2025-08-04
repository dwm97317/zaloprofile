import React, { useEffect, useState } from "react";
import { Page, useNavigate, Text, Button, Modal, useLocation } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { orderStatusState, userState, guideTypeState } from "../../state";
import Tab from "../../components/Tab/Tab";
import Loading from "../../components/Loading/Index";
import ZaloQRLogin from "../../components/ZaloQRLogin";
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
  const [showQRLogin, setShowQRLogin] = useState(false);
  let oaUserId = "";
  let oAflag = false;
  // Xử lý đăng nhập dịch vụ
  const doLogin = (access) => {
    console.log("开始登录，accesstoken:", access);

    // 验证accesstoken是否有效
    if (!access || access === '' || access === null || access === undefined) {
      console.error("传入的accesstoken无效:", access);
      showToast({
        message: "获取用户授权失败，请重试",
        type: "fail"
      });
      setLoading(false);
      setLoadingText("");
      return;
    }

    request
      .post("passport/loginbyzalo&wxapp_id=10001", {
        form: { accesstoken: access },
      })
      .then((res) => {
        console.log("登录响应:", res);
        setLoading(false);
        setLoadingText("");

        if (res.code == 0) {
          console.error("登录失败:", res.msg);
          showToast({
            message: res.msg || "登录失败，请重试",
            type: "fail"
          });
          return;
        }

        // 登录成功
        console.log("登录成功，用户数据:", res.data);

        // 验证返回的用户数据完整性
        if (!res.data.user_id || !res.data.token) {
          console.error("用户数据不完整:", res.data);
          showToast({
            message: "登录数据异常，请重试",
            type: "fail"
          });
          return;
        }

        showToast({
          message: "Đăng nhập thành công",
          type: "success"
        });

        // 构建完整的用户信息对象
        const completeUserInfo = {
          user_id: res.data.user_id,
          nickname: res.data.nickname || res.data.nickName || 'Zalo用户',
          token: res.data.token,
          avatarUrl: res.data.avatarUrl || '',
          mobile: res.data.mobile || '',
          balance: res.data.balance || 0,
          isLogin: true,
        };

        console.log("完整用户信息:", completeUserInfo);

        // 更新本地状态
        setUserInfo(completeUserInfo);
        setUserState({
          token: res.data.token,
          userInfo: completeUserInfo
        });

        // 存储到本地存储
        setStorage({
          data: {
            isLogin: true,
            user_id: res.data.user_id,
            nickname: completeUserInfo.nickname,
            avatarUrl: completeUserInfo.avatarUrl,
            token: res.data.token,
            userInfo: completeUserInfo
          },
        });

        setConfirmVisable(true);
      })
      .catch((err) => {
        console.error("登录请求失败:", err);
        showToast({
          message: "网络错误，登录失败",
          type: "fail"
        });
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
            console.log("获取到的accesstoken:", accesstoken);

            // 验证accesstoken是否有效
            if (!accesstoken || accesstoken === '' || accesstoken === null) {
              console.error("获取到的accesstoken为空:", accesstoken);
              showToast({
                message: "获取用户授权失败，请重试",
                type: "fail"
              });
              setLoading(false);
              setLoadingText("");
              return;
            }

            doLogin(accesstoken);
          },
          fail: (error) => {
            console.error("获取accesstoken失败:", error);
            showToast({
              message: "获取用户授权失败，请重试",
              type: "fail"
            });
            setLoading(false);
            setLoadingText("");
          }
        });
      },
      fail: (err) => {
        console.log("登录失败:", err);
        showToast({
          message: "登录失败，请重试",
          type: "fail"
        });
      },
    });
  };

  // 处理二维码登录成功
  const handleQRLoginSuccess = async (loginData) => {
    console.log("二维码登录成功:", loginData);

    try {
      const { user_id, nickname, avatarUrl, token } = loginData;

      // 构建用户信息
      const userInfo = {
        isLogin: true,
        user_id: user_id,
        nickname: nickname || '',
        avatarUrl: avatarUrl || '',
        token: token
      };

      // 存储用户信息
      await setStorage({
        isLogin: true,
        nickname: nickname || '',
        avatarUrl: avatarUrl || '',
        token: token,
        user_id: user_id,
        userInfo: userInfo
      });

      // 更新状态
      setUserInfo(userInfo);
      setUserState({
        token: token,
        user_id: user_id,
        nickname: nickname || '',
        avatarUrl: avatarUrl || ''
      });

      // 关闭二维码登录弹窗
      setShowQRLogin(false);

      // 获取用户详细数据
      getUserData();

      showToast({
        message: "登录成功！",
        type: "success"
      });

    } catch (error) {
      console.error("处理二维码登录成功回调失败:", error);
      showToast({
        message: "登录处理失败，请重试",
        type: "fail"
      });
    }
  };

  // 处理二维码登录失败
  const handleQRLoginError = (error) => {
    console.error("二维码登录失败:", error);
    showToast({
      message: error.message || "登录失败，请重试",
      type: "fail"
    });
  };

  // 打开二维码登录
  const openQRLogin = () => {
    setShowQRLogin(true);
  };

  // 关闭二维码登录
  const closeQRLogin = () => {
    setShowQRLogin(false);
  };

  const getUserInfos = async () => {
    console.log("加载用户信息");
    try {
      const { isLogin, nickname, avatarUrl, token, user_id, userInfo } = await getStorage({
        keys: ["isLogin", "nickname", "avatarUrl", "token", "user_id", "userInfo"],
      });

      console.log("从存储加载的数据:", { isLogin, nickname, avatarUrl, token, user_id, userInfo });

      // 构建用户信息对象，优先使用完整的userInfo
      let user = {};
      if (userInfo && typeof userInfo === 'object') {
        user = {
          ...userInfo,
          isLogin: isLogin || userInfo.isLogin || false
        };
      } else {
        user = {
          isLogin: isLogin || false,
          nickname: nickname || '',
          avatarUrl: avatarUrl || '',
          token: token || '',
          user_id: user_id || '',
        };
      }

      console.log("构建的用户信息:", user);

      // 如果用户已登录且有token，验证token有效性并获取最新数据
      if (user.isLogin && user.token) {
        getUserData();
      }

      setUserInfo(user);

      // 同步到Recoil状态
      if (user.token) {
        setUserState({
          token: user.token,
          userInfo: user
        });
      }

    } catch (error) {
      console.error("加载用户信息失败:", error);
      setUserInfo({
        isLogin: false,
        nickname: '',
        avatarUrl: '',
        token: '',
        user_id: '',
      });
    }
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
              <div className="login-buttons">
                <Button className="loginBtn" onClick={() => handleLogin()}>
                  Đăng nhập ngay
                </Button>
                <Button
                  className="qr-login-btn"
                  onClick={openQRLogin}
                  style={{
                    marginTop: '8px',
                    backgroundColor: '#0084ff',
                    fontSize: '12px',
                    padding: '6px 12px'
                  }}
                >
                  📱 扫码登录
                </Button>
              </div>
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

      {/* 二维码登录弹窗 */}
      <Modal
        visible={showQRLogin}
        title=""
        onClose={closeQRLogin}
        actions={[]}
        style={{
          '--zm-modal-content-padding': '0',
          '--zm-modal-header-padding': '0'
        }}
      >
        <ZaloQRLogin
          onLoginSuccess={handleQRLoginSuccess}
          onLoginError={handleQRLoginError}
          onClose={closeQRLogin}
        />
      </Modal>

      <Tab current="mine" />
    </Page>
  );
};

export default HomePage;
