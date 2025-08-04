import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src",
  base: "",
  plugins: [react()],

  // 强制设置构建目标，确保兼容 Zalo Mini App Studio
  build: {
    target: ['es2020', 'chrome80', 'safari13'], // 使用更具体的目标，支持 async generators
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
        format: 'es',
        // 强制设置目标环境
        generatedCode: {
          preset: 'es2015'
        }
      }
    }
  },

  // 强制 esbuild 使用兼容的目标
  esbuild: {
    target: 'es2020', // 支持 async generators 但保持较好兼容性
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
      target: 'es2020'
    }
  },

  // 定义全局常量，确保构建时的一致性
  define: {
    __BUILD_TARGET__: '"es2020"'
  }

});
