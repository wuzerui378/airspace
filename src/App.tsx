import React from 'react';
import AirspaceCapacityForm from './components/AirspaceCapacityForm/AirspaceCapacityForm';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>无人机空域容量验证分析</h1>
      <AirspaceCapacityForm />
    </div>
  );
};

export default App;