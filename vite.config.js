import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    root: "./src",
    base: "",
    plugins: [reactRefresh()],
    
    esbuild: {
      target: 'es2022',
      logLevel: 'debug', // 启用调试日志
      // 强制保留async generator语法
      legalComments: 'none',
      supported: {
        // 明确启用这些特性
        'async-generator': true,
        'for-await': true
      }
    },

  });
};
