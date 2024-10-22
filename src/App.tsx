import React, { useState } from 'react';
import AirspaceCapacityForm from './components/AirspaceCapacityForm';
import LoginForm from './components/LoginForm';
import './App.css';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (username: string, password: string) => {
    // 这里应该有实际的登录逻辑，比如调用 API
    if (username === 'admin' && password === '123456') {
      setIsLoggedIn(true);
    } else {
      alert('登录失败，请检查用户名和密码');
    }
  };

  return (
    <div className="App">
      <h1>无人机空域容量验证分析</h1>
      {isLoggedIn ? (
        <AirspaceCapacityForm />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;