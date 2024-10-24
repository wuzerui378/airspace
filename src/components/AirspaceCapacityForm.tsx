import axios from 'axios';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import '../static/AirspaceCapacityForm.css';

function AirspaceCapacityForm() {
  const [formData, setFormData] = useState({
    delta_ij: 1.5,
    gamma: 20,
    sigma_o: 10,
    pv: 0.01,
    Tm: 1,
  });

  const [calculatedCapacity, setCalculatedCapacity] = useState<number | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: parseFloat(value),
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/airspace/airspaceCapacity/calculate', formData);
      setCalculatedCapacity(response.data.calculatedCapacity);
    } catch (error) {
      console.error('提交数据时出错:', error);
      alert('提交数据时出错');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="delta_ij">最小允许间隔 (km):</label>
          <input
            type="number"
            id="delta_ij"
            name="delta_ij"
            value={formData.delta_ij}
            onChange={handleChange}
            required
            step="0.1"
          />
          <span className="unit">千米</span>
        </div>
        <div className="form-group">
          <label htmlFor="gamma">空投场公共运行长度 (km):</label>
          <input
            type="number"
            id="gamma"
            name="gamma"
            value={formData.gamma}
            onChange={handleChange}
            required
          />
          <span className="unit">千米</span>
        </div>
        <div className="form-group">
          <label htmlFor="sigma_o">占用时间的标准差 (秒):</label>
          <input
            type="number"
            id="sigma_o"
            name="sigma_o"
            value={formData.sigma_o}
            onChange={handleChange}
            required
          />
          <span className="unit">秒</span>
        </div>
        <div className="form-group">
          <label htmlFor="pv">违反最小间隔的概率:</label>
          <input
            type="number"
            id="pv"
            name="pv"
            value={formData.pv}
            onChange={handleChange}
            required
            min="0"
            max="1"
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label htmlFor="Tm">时间段 (小时):</label>
          <input
            type="number"
            id="Tm"
            name="Tm"
            value={formData.Tm}
            onChange={handleChange}
            required
          />
          <span className="unit">小时</span>
        </div>
        <button type="submit">计算容量</button>
      </form>
      {calculatedCapacity !== null && (
        <div className="result">
          <h3>计算结果:</h3>
          <p>空域容量: {calculatedCapacity}</p>
        </div>
      )}
    </div>
  );
}

export default AirspaceCapacityForm;