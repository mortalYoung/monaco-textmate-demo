import { defineConfig } from "umi";
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

export default defineConfig({
  routes: [
    { path: "/", component: "index" },
    { path: "/docs", component: "docs" },
  ],
  npmClient: "pnpm",
  chainWebpack(memo) {
    memo.plugin("m").use(MonacoWebpackPlugin, [{ languages: [] }]);
  },
});
