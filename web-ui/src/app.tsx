// 运行时配置
import { RunTimeLayoutConfig, history } from '@umijs/max';
import LOGO from './assets/logo.png'
import './monaco'
import { colorPrimary } from './constants/theme';
import RightContent from './layouts/RightContent';
import { menuContentRender } from './utils/render';
import request from './utils/request';
import { setupGlobalErrorHandling } from './utils/setupGlobalErrorHandling';
setupGlobalErrorHandling()

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate

export async function getInitialState(): Promise<InitisalState | undefined> {
  try {
    if (history.location.pathname === '/share') {
      return undefined
    }
    const user = await request.GET<LoginUser>('/user/info'); // 假设 getUserInfo 是获取用户信息的请求
    return { user, token: user.tokenInfo }
  } catch (error) {
    console.error('获取用户信息失败', error)
    return;
  }
}

export function patchRoutes({ routes }: { routes: any[] }) {
  // 可选：存储到全局变量供其他地方访问
  // @ts-ignore
  window.routes = routes;
}

export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    menuContentRender,
    logo: LOGO,
    menu: {
      // locale: true,
      defaultOpenAll: true
    },
    layout: 'mix',
    collapsedButtonRender: false,
    token: {
      sider: {
        colorTextMenuActive: colorPrimary
      }
    },
    splitMenus: true,
    contentStyle: {
      height: 'calc(100vh - 56px)',
      overflow: 'hidden',
      width: '100%',
      padding: '0px',
    },
    rightContentRender: (props, dom) => <RightContent />
  };
};
