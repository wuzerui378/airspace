import axios from 'axios';
import React, { useState, ChangeEvent,FormEvent } from 'react';
import './AirspaceCapacityForm.css'; 
import './AirspaceCapacityForm';

function AirspaceCapacityForm() {
    const [formData, setFormData] = useState({
      availableVolume: '',
      safetyInterval: '',
      safetyFactor: '',
      restrictedAirspaceRatio: '',
      efficiencyFactor: ''
    });
  
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    };
  
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        const response = await axios.post('/api/airspace-capacity', formData);
        alert(`计算的容量: ${response.data.calculatedCapacity}`);
      } catch (error) {
        console.error('提交数据时出错:', error);
        alert('提交数据时出错');
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="availableVolume">可用容量 (V):</label>
          <input
            type="number"
            id="availableVolume"
            name="availableVolume"
            value={formData.availableVolume}
            onChange={handleChange}
            required
          />
          <span className="unit">立方米</span>
        </div>
        <div className="form-group">
          <label htmlFor="safetyInterval">安全间隔 (V):</label>
          <input
            type="number"
            id="safetyInterval"
            name="safetyInterval"
            value={formData.safetyInterval}
            onChange={handleChange}
            required
          />
          <span className="unit">立方米</span>
        </div>
        <div className="form-group">
          <label htmlFor="safetyFactor">安全系数 (f):</label>
          <input
            type="number"
            id="safetyFactor"
            name="safetyFactor"
            value={formData.safetyFactor}
            onChange={handleChange}
            required
            min="1"
            step="0.1"
          />
        </div>
        <div className="form-group">
          <label htmlFor="restrictedAirspaceRatio">限制空域比率 (Rb):</label>
          <input
            type="number"
            id="restrictedAirspaceRatio"
            name="restrictedAirspaceRatio"
            value={formData.restrictedAirspaceRatio}
            onChange={handleChange}
            required
            min="0"
            max="1"
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label htmlFor="efficiencyFactor">效率系数 (E):</label>
          <input
            type="number"
            id="efficiencyFactor"
            name="efficiencyFactor"
            value={formData.efficiencyFactor}
            onChange={handleChange}
            required
            min="0"
            max="1"
            step="0.01"
          />
        </div>
        <button type="submit">计算容量</button>
      </form>
    );
  }
  
  export default AirspaceCapacityForm;