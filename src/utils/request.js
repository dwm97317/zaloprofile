import axios from "axios";
import { BASE_URL, TIMEOUT, WXAPP_ID } from "../config/config";

// Default settings
axios.defaults.headers["Content-Type"] = "application/json";
axios.defaults.timeout = TIMEOUT;
axios.defaults.baseURL = BASE_URL;

// Request interceptor
axios.interceptors.request.use(
  async (config) => {
    // Get token from localStorage (standard web practice)
    const token = localStorage.getItem("token");

    // Initialize params if not exists
    if (config.params === undefined) {
      config.params = {};
    }

    // Always add wxapp_id
    config.params["wxapp_id"] = WXAPP_ID;

    // Add token if exists
    if (token) {
      config.params["token"] = token;
    }

    config.headers.platform = "LINE"; // Changed from ZALO
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axios.interceptors.response.use(
  (response) => {
    if (response.data && (response.data.returnCode === "0014" || response.data.code === 401)) {
      // Session expired
      localStorage.removeItem("token");
      // Redirect to login or refresh page can be handled here or in components
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
    }

    let errorData = { code: 500, msg: "Network Error", data: null };

    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;

      if (typeof responseData === 'string') {
        try {
          const jsonMatch = responseData.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            errorData = { code: status, msg: parsed.msg || parsed.message || 'Server Error', data: parsed };
          } else {
            const titleMatch = responseData.match(/<h1[^>]*>([^<]+)<\/h1>/i);
            const messageMatch = responseData.match(/<p[^>]*>([^<]+)<\/p>/i);
            const title = titleMatch ? titleMatch[1].trim() : '';
            const message = messageMatch ? messageMatch[1].trim() : '';
            errorData = { code: status, msg: title || message || `Server Error (${status})`, data: null };
          }
        } catch (e) {
          errorData = { code: status, msg: `Server Error (${status})`, data: null };
        }
      } else if (responseData && typeof responseData === 'object') {
        errorData = {
          code: responseData.code || status,
          msg: responseData.msg || responseData.message || responseData.error || 'Server Error',
          data: responseData.data || null
        };
      } else {
        errorData = { code: status, msg: `Error ${status}`, data: null };
      }
    } else if (error.request) {
      errorData = { code: 0, msg: "No response from server. Please check your connection.", data: null };
    } else {
      errorData = { code: 0, msg: error.message || "Request failed", data: null };
    }

    console.error("API Error:", error);
    console.error("Error details:", errorData);
    return Promise.resolve({ data: errorData, status: errorData.code });
  }
);

// Helper to check status and handle errors
function checkStatus(response) {
  return new Promise((resolve) => {
    if (response && response.data && typeof response.data === 'object' && 'code' in response.data) {
      resolve(response.data);
    } else if (response && (response.status === 200 || response.status === 304 || response.status === 400)) {
      resolve(response.data);
    } else {
      console.error("Network error:", response);
      resolve({ code: 500, msg: "Network Error", data: null });
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
