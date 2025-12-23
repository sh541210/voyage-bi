import React from 'react';
import { Form, Input, Button, message } from 'antd';
import LOGO from '@/assets/logo.png'; // 导入 logo 图片
import { useLogin } from '@/utils/login/base';
import request from '@/utils/request';
import { ENABLE_SMS_LOGIN } from '@/options';

const LoginPage: React.FC = () => {
    const { loading, doLogin } = useLogin()
    const [form] = Form.useForm()
    const [sendingCode, setSendingCode] = React.useState(false);
    const [countDown, setCountDown] = React.useState(60);

    const handleSendCode = () => {
        const mobile = form.getFieldValue('mobile');
        if (!mobile) {
            return message.warning('请输入手机号');
        }
        // 调用后端接口发送验证码
        request.POST('/user/sendLoginCode', { mobile })
            .then(() => {
                setSendingCode(true);
                message.success('验证码已发送');
                // 倒计时
                let time = 60;
                const timer = setInterval(() => {
                    time -= 1;
                    setCountDown(time);
                    if (time <= 0) {
                        clearInterval(timer);
                        setSendingCode(false);
                    }
                }, 1000);
            })
    };

    // 根据登录模式提交不同参数
    const handleLogin = (values: any) => {
        if (ENABLE_SMS_LOGIN) {
            doLogin({
                mobile: values.mobile,
                code: values.code,
            });
        } else {
            doLogin({
                username: values.username,
                password: values.password,
            });
        }
    };

    React.useEffect(() => {
        if (ENABLE_SMS_LOGIN) {
            form.resetFields(['username', 'password']);
        } else {
            form.resetFields(['mobile', 'code']);
        }
    }, []);

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
                <Form form={form} name="login" onFinish={handleLogin}>
                    {/* 账号密码登录 */}
                    {!ENABLE_SMS_LOGIN && (
                        <>
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
                        </>
                    )}

                    {/* 手机验证码登录 */}
                    {ENABLE_SMS_LOGIN && (
                        <>
                            <Form.Item
                                name="mobile"
                                rules={[{ required: true, message: '请输入手机号' },
                                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
                                ]}
                            >
                                <Input placeholder="手机号" />
                            </Form.Item>

                            <Form.Item
                                name="code"
                                rules={[{ required: true, message: '请输入短信验证码' }]}
                            >
                                <Input
                                    placeholder="短信验证码"
                                    suffix={
                                        <Button
                                            type="link"
                                            onClick={handleSendCode}
                                            disabled={sendingCode}
                                        >
                                            {sendingCode ? `${countDown}s` : '获取验证码'}
                                        </Button>
                                    }
                                />
                            </Form.Item>
                        </>
                    )}
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