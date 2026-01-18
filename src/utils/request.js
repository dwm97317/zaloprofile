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
    if (!config.params) {
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

// Simple LRU Cache implementation
class SimpleLRUCache {
  constructor(limit = 100) {
    this.limit = limit;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    // Refresh item by deleting and re-inserting
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.limit) {
      // Evict the least recently used item (first item in Map)
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);
    }
    this.map.set(key, value);
  }

  delete(key) {
    this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }
}

const CACHE = new SimpleLRUCache(100); // Limit to 100 items
const PENDING_MAP = new Map();

// Generate unique, stable key for request
const generateKey = (method, url, params) => {
  try {
    let paramStr = '';
    if (params && typeof params === 'object') {
      // Sort keys to ensure stability: {a:1, b:2} == {b:2, a:1}
      const sortedKeys = Object.keys(params).sort();
      const sortedObj = {};
      sortedKeys.forEach(key => {
        sortedObj[key] = params[key];
      });
      paramStr = JSON.stringify(sortedObj);
    } else if (params) {
      paramStr = String(params);
    }
    return `${method}:${url}:${paramStr}`;
  } catch (e) {
    return `${method}:${url}`;
  }
};

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

  get(url, params, options = {}) {
    const { cache = false, ttl = 60000, force = false } = options;
    const method = 'get';
    const key = generateKey(method, url, params);

    // 1. Check Memory Cache
    if (cache && !force) {
      const cached = CACHE.get(key);
      if (cached) {
        const now = Date.now();
        if (now - cached.timestamp < ttl) {
          // Cache hit
          return Promise.resolve(JSON.parse(JSON.stringify(cached.data))); // Return deep copy to prevent mutation
        } else {
          // Cache expired
          CACHE.delete(key);
        }
      }
    }

    // 2. Check Pending Requests (Deduplication)
    // Only deduplicate if caching is enabled or explicitly requested (future)
    // For now, we apply deduplication for all GET requests to prevent concurrent identical requests
    if (PENDING_MAP.has(key)) {
      return PENDING_MAP.get(key);
    }

    const requestPromise = axios({
      method: "get",
      url,
      params,
    })
      .then((response) => {
        return checkStatus(response);
      })
      .then((data) => {
        // Remove from pending map
        PENDING_MAP.delete(key);

        // Save to cache if enabled
        if (cache && data.code === 200) { // Only cache successful responses
          // Check returnCode for Zalo/Line logic if necessary, but usually code 200 is API success
          CACHE.set(key, {
            data,
            timestamp: Date.now()
          });
        }

        return data;
      })
      .catch((err) => {
        PENDING_MAP.delete(key);
        return Promise.reject(err);
      });

    PENDING_MAP.set(key, requestPromise);
    return requestPromise;
  },

  // Method to clear cache manually
  clearCache() {
    CACHE.clear();
  }
};
