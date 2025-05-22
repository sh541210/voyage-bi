import React from 'react';
import { Form, Input, Button } from 'antd';
import LOGO from '@/assets/logo.png'; // 导入 logo 图片
import { useLogin } from '@/utils/login/base';

const LoginPage: React.FC = () => {
    const { loading, doLogin } = useLogin()
    return (
        <div id='logo' className="min-h-screen flex flex-col items-center justify-center bg-antdColorBgLayout dark:bg-antdDarkContainer">
            {/* Logo 区域 */}
            <div className="mb-6">
                <img src={LOGO} alt="Logo" className="w-24 h-24" /> {/* 显示 Logo */}
            </div>
            {/* 标题区域 */}
            <a><h1
                className="text-[28px] text-3xl font-semibold mb-10 text-black dark:text-white">欢迎来到
                DataVoyage
            </h1></a>
            {/* 登录表单区域 */}
            <div className="w-full max-w-sm bg-white dark:bg-antdDarkContainer shadow-md rounded-sm p-8">
                <Form name="login" onFinish={doLogin}>
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input placeholder="用户名" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password placeholder="密码" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default LoginPage;