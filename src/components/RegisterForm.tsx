import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import axios from 'axios';
const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const userData = {
      username,
      password,
      email,
      phone
    };

    try {
      const response = await axios.post(
        'http://localhost:8080/airspace/users/register',
        userData
      );
      message.success('注册成功！', 2, () => {
        navigate('/login');
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data || '注册失败，请稍后再试';
        message.error(errorMessage);
        setError(errorMessage);
      } else {
        console.error('Error during registration:', error);
        setError('注册过程中发生错误，请稍后再试');
      }
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      {error && <div className="error-message">{error}</div>}
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
      <div className="form-group">
        <label htmlFor="email">邮箱:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="phone">电话号码:</label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <button type="submit">注册</button>
      <button type="button" onClick={handleBackToLogin}>返回登录</button>
    </form>
  );
};

export default RegisterForm;