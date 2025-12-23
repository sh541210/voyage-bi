
import { history, useModel } from 'umi';
import request from '../request';
import { message } from 'antd';
import { useEffect, useState } from 'react';
const TOKEN_NAME = 'user-token';

export const useLogin = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const { setInitialState } = useModel('@@initialState')

    useEffect(() => {
        getUserToken() && redirect()
        // 自动登录
        const automicLoginUser: LoginRequest =
            JSON.parse(localStorage.getItem('automatic_login_user') || '{}')
        automicLoginUser.password && doLogin(automicLoginUser)
    }, []); // 检查登录状态

    const doLogin = (loginRequest: LoginRequest) => {
        setLoading(true)
        request.POST<LoginSuccess>('/user/doLogin', loginRequest).then(data => {
            message.success('登录成功')
            setLoading(false)
            if (data.tokenInfo) {
                setInitialState((prevState) => ({
                    ...prevState,
                    token: data.tokenInfo,
                    user: {
                        ...data.user, // 将登录后的用户信息保存
                        name: data.user.nickname,
                        avatar: data.user.avatarImgUrl
                    }
                }));
                redirect()
            }
        }).catch(() => {
            setLoading(false)
        })
    };

    return {
        loading,
        doLogin
    }
}

export const doLogout = async () => {
    await request.POST('/user/doLogout');
    message.success('退出登录成功!')
    history.push('/login');
}

export const getUserToken = () => {
    const match = document.cookie.match(new RegExp('(^| )' + TOKEN_NAME + '=([^;]+)'));
    if (match) {
        return match[2];  // 返回匹配到的值
    }
    return null;
}

export const clearToken = () => {
    document.cookie = `${TOKEN_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

export const redirect = () => {
    const url = window.location.hash;
    const redirect = new URLSearchParams(url.substring(url.indexOf('?') + 1))?.get('redirect');
    history.push(redirect || '/home');
}