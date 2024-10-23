import { message } from 'antd';
import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User } from '../types/User';  // 确保导入User接口

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post<User>('http://localhost:8080/airspace/users/login', null, {
        params: {
          username,
          password
        }
      });

      const user = response.data;
      console.log(user.role);

      message.success('登录成功');
      // 根据角色导航到不同页面
      if (user.role === 'ADMIN') {
        console.log('222222222222')
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
    navigate('/register')
  }

  return (
    <form onSubmit={handleLogin} className="login-form">
      <div className="form-group">
        <label htmlFor="username">用户名:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">密码:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">登录</button>
      <button type='button' onClick={handleRegister}>注册</button>
    </form>
  );
};

export default LoginForm;