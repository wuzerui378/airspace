// LoginForm.tsx

import React from 'react';
import { Form, Input, Button, message, Typography, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User } from '../types/User';

const { Title } = Typography;

const LoginForm: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const response = await axios.post<User>(
          'http://localhost:8080/airspace/users/login',
          null,
          {
            params: {
              username: values.username,
              password: values.password,
            },
          }
      );

      const user = response.data;
      console.log(user.role);

      message.success('登录成功');
      // 根据角色导航到不同页面
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/main');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        message.error(error.response?.data || '登录失败，请检查用户名和密码');
      } else {
        message.error('登录失败');
      }
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
      <Row
          justify="center"
          align="middle"
          style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}
      >
        <Col>
          <div style={{ maxWidth: '400px', padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
              用户登录
            </Title>
            <Form
                name="login_form"
                onFinish={onFinish}
                initialValues={{ remember: true }}
            >
              <Form.Item
                  name="username"
                  rules={[{ required: true, message: '请输入用户名！' }]}
              >
                <Input
                    prefix={<UserOutlined className="site-form-item-icon" />}
                    placeholder="用户名"
                    size="large"
                />
              </Form.Item>
              <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码！' }]}
              >
                <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="密码"
                    size="large"
                />
              </Form.Item>
              <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    style={{ marginBottom: '16px' }}
                >
                  登录
                </Button>
                <Button block size="large" onClick={handleRegister}>
                  注册
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
  );
};

export default LoginForm;