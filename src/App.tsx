import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import MainPage from './components/MainPage';
import AirspaceCapacityForm from './components/AirspaceCapacityForm';
import KeyParameterCalculation from './components/KeyParameterCalculation';
import RegisterForm from './components/RegisterForm';
import UserManagement from './components/UserManagement';
import './App.css';
import HistoryCapacity from './components/HistoryCapacity';

const App: React.FC = () => {
  return (

      <Router>
        <div className="App">
          <h1>无人机空域容量验证分析</h1>
          <Routes>
            {/* 公共路由 */}
            <Route path="/login" element={<LoginForm />} />

            <Route path="/register" element={<RegisterForm />} />
            
            {/* 需要登录的路由 */}
            <Route path="/main" element={
                <MainPage />
            } />
            <Route path="/capacity" element={
                <AirspaceCapacityForm />
            } />
            <Route path="/parameter" element={
                <KeyParameterCalculation />
            } />
            
            {/* 管理员路由 */}
            <Route path="/admin" element={
                <UserManagement />
            } />
            <Route path="/history" element={
                <HistoryCapacity />
            } />


            
            {/* 默认重定向到登录页 */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>

  );
};

export default App;