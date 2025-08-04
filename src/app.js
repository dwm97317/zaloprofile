// 早期兼容性修复 - 必须在所有其他导入之前
import "./compatibility-early.js";

// JavaScript 兼容性 polyfills
import "./polyfills.js";

// Import React and ReactDOM
import React from "react";
import { createRoot } from "react-dom/client";

// 导入兼容性修复
import { initCompatibilityFixes } from "./utils/compatibility";

// 立即执行兼容性修复
initCompatibilityFixes();

// Import tailwind styles
import "./css/tailwind.css";

import "zmp-ui/zaui.css";

import "./css/app.scss";

// Import App Component
import App from "./components/app";
import appConfig from "../app-config.json";

if (!window.APP_CONFIG) {
  window.APP_CONFIG = appConfig;
}

// Mount React App
const root = createRoot(document.getElementById("app"));
root.render(React.createElement(App));
