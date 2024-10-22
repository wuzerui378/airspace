import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import MainPage from './components/MainPage';
import AirspaceCapacityForm from './components/AirspaceCapacityForm';
import KeyParameterCalculation from './components/KeyParameterCalculation';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <h1>无人机空域容量验证分析</h1>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/capacity" element={<AirspaceCapacityForm />} />
          <Route path="/parameter" element={<KeyParameterCalculation />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;