import axios from "axios";
import { getStorage, showToast } from "zmp-sdk";
import { BASE_URL, TIMEOUT } from "../config/config";

axios.defaults.headers["Content-Type"] = "application/json";
// 响应时间
axios.defaults.timeout = TIMEOUT;
axios.defaults.baseURL = BASE_URL;
//请求拦截器
axios.interceptors.request.use(
  async (config) => {
    const { token } = await getStorage({
      keys: ["token"],
    });
    if (token) {
      if (config.method == "get") {
        if (config.params == undefined) {
          config.params = {};
        }
        config.params["token"] = token;
      }
      if (config.method == "post") {
        if (config.data == undefined) {
          config.data = {};
        }
        config.data["token"] = token;
      }
      // 设置统一的请求header
      // config.headers.authorization = token; //授权(每次请求把token带给后台)
    }
    config.headers.platform = "ZALO"; //后台需要的参数
    return config;
  },
  (error) => {
    console.log(error, "error");
    return Promise.reject(error);
  },
);

//响应拦截器
axios.interceptors.response.use(
  (response) => {
    if (response.data.returnCode === "0014") {
      // 登录失效
      setTimeout(() => {
        //让用户从新回到登录页面
      }, 2000);
    }
    return response;
  },
  (error) => {
    return Promise.resolve(error.response);
  },
);

// 处理请求返回的数据
function checkStatus(response) {
  console.log(response,'res')
  return new Promise((resolve, reject) => {
    if (
      response &&
      (response.status === 200 ||
        response.status === 304 ||
        response.status === 400)
    ) {
      resolve(response.data);
    } else {
      console.log(response, "response");
      resolve("");
      showToast({
        message: "网络错误",
      });
      console.log("網絡錯誤");
    }
  });
}

export default {
  post(url, params) {
    return axios({
      method: "post",
      url,
      data: params,
    }).then((response) => {
      return checkStatus(response);
    });
  },
  get(url, params) {
    return axios({
      method: "get",
      url,
      params,
    }).then((response) => {
      return checkStatus(response);
    });
  },
};
