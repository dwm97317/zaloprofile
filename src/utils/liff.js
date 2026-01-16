import liff from "@line/liff";
import axios from "axios";
import { BASE_URL, DEV_AUTO_LOGIN } from "../config/config";

// Global Promise to track Google Maps loading
let googleMapsPromise = null;

export const loadGoogleMaps = (apiKey) => {
    if (googleMapsPromise) return googleMapsPromise;

    googleMapsPromise = new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve(window.google.maps);
            return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=th`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google.maps);
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
    });

    return googleMapsPromise;
};

/**
 * 开发环境自动登录
 * 自动调用后端API获取有效token
 */
const autoLoginInDev = async () => {
    if (!DEV_AUTO_LOGIN.enabled) {
        return false;
    }

    try {
        console.log("🔧 Development mode: Auto-login enabled");
        
        // 检查是否已有token
        const existingToken = localStorage.getItem("token");
        if (existingToken && !existingToken.startsWith("dev-token-")) {
            console.log("✅ Using existing valid token:", existingToken);
            return true;
        }

        // 调用后端API生成token
        console.log("🔑 Generating development token...");
        const response = await axios.get(
            `${BASE_URL}dev_token/generate&user_id=${DEV_AUTO_LOGIN.userId}&wxapp_id=${DEV_AUTO_LOGIN.wxappId}`
        );

        if (response.data && response.data.code === 1) {
            const { token, user_id } = response.data.data;
            localStorage.setItem("token", token);
            localStorage.setItem("userId", user_id.toString());
            console.log("✅ Development token set successfully");
            console.log("   User:", response.data.data.user.nickName);
            console.log("   Token:", token);
            return true;
        } else {
            console.error("❌ Failed to generate development token:", response.data.msg);
            return false;
        }
    } catch (error) {
        console.error("❌ Auto-login failed:", error.message);
        return false;
    }
};

export const initLIFF = async () => {
    try {
        // 1. Fetch configuration from backend
        // 注意：ThinkPHP 路由使用小写加下划线格式
        const response = await axios.get(`${BASE_URL}line_app/base&wxapp_id=10001`);
        
        // Check if response has the expected structure
        if (!response.data || !response.data.data || !response.data.data.config) {
            console.error("Invalid API response structure:", response.data);
            throw new Error("Invalid API response");
        }
        
        const { config } = response.data.data;

        // In development mode, skip LIFF initialization if not enabled
        if (!config.is_enable) {
            console.warn("LINE Mini App is not enabled in backend. Running in development mode without LIFF.");
            
            // 尝试自动登录（仅开发环境）
            const autoLoginSuccess = await autoLoginInDev();
            
            if (!autoLoginSuccess) {
                // 如果自动登录失败，使用旧的fallback逻辑
                if (!localStorage.getItem("token")) {
                    localStorage.setItem("token", "dev-token-" + Date.now());
                    localStorage.setItem("userId", "dev-user-123");
                    console.log("⚠️ Using fallback dev token");
                } else {
                    console.log("Using existing token:", localStorage.getItem("token"));
                }
            }
            
            return config;
        }

        // Load Google Maps if key exists
        if (config.google_maps_key) {
            loadGoogleMaps(config.google_maps_key).catch(e => console.error("Google Maps Load Error", e));
        }

        // 2. Initialize LIFF (生产环境)
        await liff.init({ liffId: config.liff_id });

        if (!liff.isLoggedIn()) {
            liff.login();
            return;
        }

        // 3. Authenticate with backend
        // 尝试获取有效的 ID Token
        let idToken = null;
        try {
            idToken = await liff.getIDToken();
            console.log("🔑 LIFF ID Token obtained (first 50 chars):", idToken.substring(0, 50) + "...");
        } catch (error) {
            console.error("Failed to get ID Token:", error);
        }
        if (idToken) {
            // 发送 ID Token 到后端进行验证和登录
            // postForm() 方法期望数据在 form 键下
            const loginRes = await axios.post(
                `${BASE_URL}passport/login_mp_line&wxapp_id=10001`,
                { 
                    form: {
                        id_token: idToken
                    }
                },
                {
                    headers: { 
                        platform: "LINE",
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log("🔐 Login API Response:", loginRes.data);

            if (loginRes.data && loginRes.data.code === 1) {
                const { token, userId, nickname } = loginRes.data.data;
                localStorage.setItem("token", token);
                localStorage.setItem("userId", userId.toString());
                console.log("✅ LINE login successful");
                console.log("   User:", nickname);
                console.log("   Token:", token.substring(0, 20) + "...");
                console.log("   Token saved to localStorage");
            } else {
                console.error("❌ Backend authentication failed:", loginRes.data?.msg || "Unknown error");
            }
        }

        const profile = await liff.getProfile();
        console.log("LIFF Profile:", profile);

        return config;
    } catch (error) {
        console.error("LIFF Initialization failed:", error);
        
        // In development, provide fallback
        if (error.message.includes("Invalid API response") || error.response?.status === 404) {
            console.warn("Running in development mode without backend");
            
            // 尝试自动登录
            const autoLoginSuccess = await autoLoginInDev();
            
            if (!autoLoginSuccess) {
                localStorage.setItem("token", "dev-token-" + Date.now());
                localStorage.setItem("userId", "dev-user-123");
            }
            
            return { is_enable: false };
        }
        
        throw error;
    }
};

export const getIDToken = () => {
    return liff.getIDToken();
};

export const getProfile = async () => {
    return await liff.getProfile();
};

export default liff;
