import { message } from 'antd';
import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
        const response = await fetch('/airspace/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            message.success('登录成功');
            navigate('/main');
        } else {
            const errorData = await response.json(); // 获取错误信息
            console.error('错误信息:', errorData);
            message.error('登录失败，请检查用户名和密码');
        }
    } catch (error) {
        message.error('登录失败')
      }
    };

  const handleRegister = () => {
    navigate('/RegisterForm')
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