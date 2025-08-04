import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    root: "./src",
    base: "",
    plugins: [react()],

    build: {
      target: 'esnext', // 根据官方文档建议，支持现代 JavaScript 特性
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false, // 保留 console 用于调试
          drop_debugger: false
        }
      },
      // 确保 rollup 也使用正确的目标
      rollupOptions: {
        output: {
          format: 'es'
        }
      }
    },

    esbuild: {
      target: 'esnext', // 支持现代语法，解决 async generator 和 for-await 问题
      logLevel: 'info',
      legalComments: 'none'
    },

    // 确保开发服务器配置
    server: {
      port: 3000,
      host: true
    },

    // 优化依赖预构建
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext'
      }
    }

  });
};
