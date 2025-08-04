import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    root: "./src",
    base: "",
    plugins: [reactRefresh()],

    build: {
      target: 'es2018', // 支持 async/await 和 async generators
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false, // 保留 console 用于调试
          drop_debugger: false
        }
      }
    },

    esbuild: {
      target: 'es2018', // 支持现代语法但保持兼容性
      logLevel: 'info',
      legalComments: 'none',
      // 启用必要的特性
      supported: {
        'async-generator': true,
        'for-await': true,
        'top-level-await': false,
        'import-assertions': false,
        'dynamic-import': true,
        'import-meta': false
      }
    },

  });
};
