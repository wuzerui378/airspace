import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="main-page">
      <h4>请选择以下功能</h4>
      <button onClick={() => navigate('/capacity')}>空域容量计算</button>
      <button onClick={() => navigate('/parameter')}>无人机仿真验证</button>
    </div>
  );
};

export default MainPage;