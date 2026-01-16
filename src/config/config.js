import { appEnv } from "./env";

// 开发环境配置
const devBaseURL = "http://localhost:8080/index.php?s=api/";

// 生产环境配置
const proBaseURL = "https://longthai.itaoth.com/index.php?s=api/";

// 根据环境选择 API 地址
export const BASE_URL = appEnv === "development" ? devBaseURL : proBaseURL;

// 请求超时时间（毫秒）
export const TIMEOUT = 10000;

// 小程序 ID
export const WXAPP_ID = "10001";

// 是否启用调试模式
export const DEBUG = appEnv === "development";

// 开发环境自动登录配置
// 在测试环境中，如果LINE未启用，自动使用此用户ID获取token
// 生产环境会自动忽略此配置
export const DEV_AUTO_LOGIN = {
    enabled: appEnv === "development", // 只在开发环境启用
    userId: 15027, // 测试用户ID
    wxappId: 10001, // 商户ID
};
