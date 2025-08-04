import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src",
  base: "",
  plugins: [react()],

  // 强制设置构建目标，确保兼容 Zalo Mini App Studio
  build: {
    target: 'esnext', // 使用 esnext 避免任何 es2015 限制
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
        // 完全移除 generatedCode 限制
        generatedCode: {
          arrowFunctions: true,
          constBindings: true,
          objectShorthand: true
        }
      }
    }
  },

  // 强制 esbuild 使用最新目标
  esbuild: {
    target: 'esnext', // 使用最新语法支持
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
  },

  // 定义全局常量，确保构建时的一致性
  define: {
    __BUILD_TARGET__: '"esnext"'
  }

});
