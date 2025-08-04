import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    root: "./src",
    base: "",
    plugins: [reactRefresh()],

    build: {
      target: 'es2015', // 更保守的目标，确保兼容性
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false, // 保留 console 用于调试
          drop_debugger: false
        }
      }
    },

    esbuild: {
      target: 'es2015', // 更保守的目标，避免现代语法
      logLevel: 'info',
      legalComments: 'none',
      // 禁用可能导致兼容性问题的特性
      supported: {
        'async-generator': false,
        'for-await': false,
        'top-level-await': false,
        'import-assertions': false,
        'dynamic-import': true, // 保留动态导入
        'import-meta': false
      }
    },

  });
};
