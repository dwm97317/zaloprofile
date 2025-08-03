import { configAppView, getStorage, openPhone, showToast } from "zmp-sdk";

export default {
  checkLogin: async (Fn) => {
    const { token } = await getStorage({
      keys: ["token"],
    });
    if (!token) {
      showToast({
        message: "请先登录",
      });
      return false;
    }
    Fn && Fn();
    return true;
  },
  openPhone: (tel) => {
    console.log(tel, "tel");
    openPhone({
      phoneNumber: tel,
      success: () => {
        // xử lý khi gọi api thành công
      },
      fail: (error) => {
        // xử lý khi gọi api thất bại
        console.log(error);
      },
    });
  },
  copy: (text) => {},
  isEmpty: (object) => {
    return Object.keys(object).length === 0;
  },
  // 设置标题
  setBarPageView: (title) => {
    configAppView({
      headerColor: "#1843EF",
      headerTextColor: "white",
      hideAndroidBottomNavigationBar: true,
      hideIOSSafeAreaBottom: true,
      actionBar: {
        title: title,
      },
      success: (res) => {
        console.log(res, "res");
        // xử lý khi gọi api thành công
      },
      fail: (error) => {
        // xử lý khi gọi api thất bại
        console.log(error);
      },
    });
  },
};
