import { message } from 'antd';
import { AxiosInstance, history } from 'umi';
import { clearToken, getUserToken } from './base';
import SignUtils from '@/utils/common/sign'

let hasShownLoginError = false; // 用于标记是否已经显示过未登录提示

// setupInterceptors 函数，用于设置请求和响应拦截器
export const setupInterceptors = (service: AxiosInstance) => {
    service.interceptors.request.use(request => {
        const location = history.location
        // 需要验签
        if (location.pathname === '/share' ||
            request.url?.startsWith('/dashboard/share/token')) {
            const headers: any = SignUtils.generateHeaders('VOYAGE BI', '',
                request.method?.toUpperCase() || 'GET',
                (request.baseURL || '') + (request.url || ''), request.data)
            request.headers = {
                ...request.headers,
                'X-Share-Token': shareToken,
                'X-Share-Key': new URLSearchParams(history.location.search).get('key'),
                ...headers
            }
        }
        return request
    })
    // 响应拦截器
    service.interceptors.response.use(
        (response) => {
            // 这里处理未登录的情况
            if (response.data && response.data.code === '101') {
                // 只显示一次未登录提示，避免重复提示
                if (!hasShownLoginError) {
                    let token = getUserToken()
                    if (token) {
                        clearToken()
                        message.error('登录状态无效，请重新登录。');
                        // 清除本地的 token
                        localStorage.removeItem('token');
                    } else {
                        message.error('请先登录')
                    }
                    hasShownLoginError = true;
                    let redirect = window.location.hash.replace(/^#/, '')
                    if (redirect.startsWith("/login")) {
                        redirect = redirect.replace('/login', '');
                    } else {
                        redirect = `?redirect=${redirect}`
                    }
                    // 跳转到登录页面，保存当前路径以便登录后返回
                    history.push(`/login${redirect}`);
                    setTimeout(() => {
                        hasShownLoginError = false
                    }, 500)
                }
            }
            // 返回正常的响应
            return response;
        },
        (error) => {
            // 处理其他类型的错误
            return Promise.reject(error);
        }
    );
    return service
};
// 内存存储 Token（仅限当前会话）
let shareToken: string | null = null;

// 对外暴露 Token 设置方法
export const setShareToken = (token: string) => {
    shareToken = token;
};