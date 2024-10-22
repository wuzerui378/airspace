import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="main-page">
      <h2>请选择功能</h2>
      <button onClick={() => navigate('/capacity')}>空域容量计算</button>
      <button onClick={() => navigate('/parameter')}>关键参数计算</button>
    </div>
  );
};

export default MainPage;