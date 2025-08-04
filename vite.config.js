import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import zaloMiniApp from "vite-plugin-zalo-mini-app";

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  plugins: [
    react(),
    zaloMiniApp({
      app: {
        title: "Hợp nhất bưu kiện Vũ Hương Trà",
        headerTitle: "Hợp nhất bưu kiện Vũ Hương Trà",
        headerColor: "#1843EF",
        textColor: "black",
        leftButton: "back",
        statusBar: "normal",
        actionBarHidden: false,
        hideAndroidBottomNavigationBar: false,
        hideIOSSafeAreaBottom: false,
        selfControlLoading: false
      },
    }),
    {
      name: "override-config",
      config: () => ({
        build: {
          target: "esnext",
        },
      }),
    },
  ],

  // 确保开发服务器配置
  server: {
    port: 3000,
    host: true
  }

});
