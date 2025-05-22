import { doLogout } from '@/utils/login/base';
import request from '@/utils/request';  // 假设这是你的请求模块
import { Form, Input, Button, Typography, message } from 'antd';

const { Title } = Typography;

const ChangePasswordPage = () => {
    const onFinish = async (values: any) => {
        request.PUT('/user/pwd', values).then(() => {
            message.success('密码修改成功!')
            doLogout()
        }).catch(() => {
            message.error('密码修改失败!')
        })
    };

    return (
        <div className="flex items-start justify-center min-h-screen pt-12">
            <div className="w-full max-w-md p-8 rounded-sm">
                <Title level={3} className="text-center mb-6">修改密码</Title>
                <Form
                    name="changePassword"
                    onFinish={onFinish}
                    initialValues={{
                        oldPwd: '',
                        newPwd: '',
                        confirmPassword: '',
                    }}
                >
                    <Form.Item
                        label="旧密码"
                        name="oldPwd"
                        rules={[{ required: true, message: '请输入旧密码' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="新密码"
                        name="newPwd"
                        rules={[{ required: true, message: '请输入新密码' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="确认新密码"
                        name="confirmPassword"
                        dependencies={['newPwd']}
                        rules={[
                            { required: true, message: '请确认新密码' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPwd') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次新密码输入不一致'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full" >确认修改</Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default ChangePasswordPage;