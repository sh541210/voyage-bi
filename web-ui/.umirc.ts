import config from "./src/constants/theme";
import { defineConfig } from "@umijs/max";
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
// const MonacoChinesePlugin = require('monaco-editor-chinese-plugin');
import CompressionPlugin from "compression-webpack-plugin";

export default defineConfig({
  codeSplitting: {
    jsStrategy: "granularChunks",
  },
  antd: {
    theme: config,
  },
  chainWebpack: (config) => {
    config.plugin("monaco-eidor").use(MonacoWebpackPlugin, [
      {
        languages: ["javascript", "typescript", "less", "css", "sql"],
      },
    ]);
    // config.plugin('monaco-editor-chinese-plugin').use(new MonacoChinesePlugin({
    //   logUnmatched: true
    // }))
    config.plugin("compression").use(CompressionPlugin, [
      {
        filename: "compressed/[base].gz",
        algorithm: "gzip",
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8,
      },
    ]);
  },
  esbuildMinifyIIFE: true,
  access: {},
  model: {},
  initialState: {},
  request: {},
  history: { type: "hash" },
  layout: {
    title: "Data Voyage",
  },
  routes: [
    {
      path: "/",
      redirect: "/home",
    },
    {
      name: "首页",
      icon: "HomeOutlined",
      path: "/home",
      component: "./Home",
    },
    {
      name: "分析视图",
      path: "/analysisView",
      component: "./Dashboard",
      icon: "DashboardOutlined",
    },
    {
      name: "数据集",
      path: "/dataSheet",
      component: "./DataSheet",
      icon: "TableOutlined",
    },
    {
      name: "数据源",
      path: "/dataSource",
      component: "./DataSource",
      icon: "DatabaseOutlined",
    },
    {
      path: "/biChart",
      name: "BI图表",
      layout: false,
      component: "./Preview/index",
    },
    {
      path: "/share",
      name: "分享链接",
      layout: false,
      component: "./Preview/index",
    },
    {
      path: "/chart/designer",
      name: "图表编辑",
      layout: false,
      component: "./Chart/Designer/index",
    },
    {
      path: "/dashboard/designer",
      name: "视图编辑",
      layout: false,
      component: "./Dashboard/DashboardDesigner/index",
    },
    { path: "/login", name: "登录", layout: false, component: "./Home/login" },
    {
      path: "/system",
      name: "系统设置",
      icon: "SettingOutlined",
      // hideInMenu: true,
      routes: [
        {
          path: "/system",
          redirect: "/system/config",
          hideInMenu: false,
        },
        {
          path: "/system/config",
          component: "./System/SystemConfig/index",
          name: "系统配置项",
          icon: "ToolOutlined",
          hideInMenu: false,
        },
        {
          path: "/system/chartComponents",
          name: "图表组件管理",
          icon: "BarChartOutlined",
          hideInMenu: false,
          routes: [
            {
              path: "/system/chartComponents",
              redirect: "/system/chartComponents/manage",
              hideInMenu: false,
            },
            {
              path: "/system/chartComponents/manage",
              component: "./System/ComponentManage/index",
              name: "图表组件列表",
              icon: "BarChartOutlined",
            },
            {
              path: "/system/chartComponents/chartComponent",
              component: "./System/ComponentManage/ScriptEditor/index",
              name: "图表组件开发",
              hideInMenu: true,
              icon: "BarChartOutlined",
            },
          ],
        },
        {
          path: "/system/theme",
          component: "./System/ThemeManage/index",
          name: "主题管理",
          icon: "SkinOutlined",
          hideInMenu: false,
        },
      ],
    },
    {
      path: "/user",
      name: "用户中心",
      icon: "UserOutlined",
      hideInMenu: true,
      routes: [
        {
          path: "/user",
          redirect: "/user/password",
          hideInMenu: false,
        },
        {
          path: "/user/password",
          component: "./User/Password",
          name: "修改密码",
          icon: "KeyOutlined",
          title: "用户中心",
          hideInMenu: false,
        },
      ],
    },
    { path: "/*", component: "@/pages/404" },
    { path: '/test', component: '@/pages/Test/Test', layout: false }
  ],

  npmClient: "yarn",
  proxy: {
    "/api": {
      target: "http://localhost:8088/api",
      changeOrigin: true,
      pathRewrite: { "^/api": "" },
    },
    "/ws": {
      target: "ws://localhost:8088/ws", // WebSocket 服务的目标地址
      ws: true, // 启用 WebSocket 代理
      changeOrigin: true, // 修改请求头中的 Origin
      pathRewrite: { "^/ws": "" }, // 如果需要移除或替换路径
    },
  },
  icons: {
    include: [
      "local:VIEW",
      "local:DASHBOARD",
      "local:REPORT",
      "local:KANBAN",
      "local:MySQL",
      "local:SelectDB",
      "local:edit",
      "local:down-xls",
      "local:delete",
      "local:copy",
      "local:dataTable",
      "local:filter",
      "local:COLUMN",
      "local:PIE",
      "local:LINE",
      "local:INDICATOR",
      "local:AMOUNT_INDICATOR",
      "local:LIQUID",
      "local:WORD_CLOUD",
      "local:GUAGE",
      "local:MAP",
      "local:TABLE",
      "local:FUNNEL",
      "local:STACKED_COLUMN_ENABLED",
      "local:STACKED_COLUMN_DISABLED",
      "local:ASC",
      "local:DESC",
      "local:NUMBER",
      "local:DATE",
      "local:TEXT",
      "local:right",
      "local:down",
      "local:left",
      "local:up",
      "local:more",
      "local:link",
      "local:link2",
      "local:link1",
      "local:link3",
      "local:link4",
      "local:REAL_TIME",
      "local:CACHE",
      "local:moon",
      "local:sun",
      "local:code",
      "local:pc",
      "local:mobile",
      "local:group",
      "local:chart",
      "local:echarts",
      "local:react",
      "local:lock",
      "local:unlock",
    ],
  },
  tailwindcss: {},
});
