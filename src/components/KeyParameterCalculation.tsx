// src/components/KeyParameterCalculation.tsx

import React, { useState, ChangeEvent, FormEvent } from 'react';
import '../static/KeyParameterCalculation.css';
import Plot from 'react-plotly.js';
import { FormData, SimulationResult, runMonteCarloSimulation } from '../utils/monteCarloSimulation';

const KeyParameterCalculation: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        availableVolume: 1000, // 默认可用容量，单位：立方米
        safetyInterval: 1.5, // 默认 delta_ij，单位：公里
        safetyFactor: 1.0, // 默认安全系数
        restrictedAirspaceRatio: 0.01, // 默认 Rb
        efficiencyFactor: 1.0, // 默认效率系数
        aircraftVolume: 50, // 默认单架飞机占用的空域体积，单位：立方米
    });

    const [calculatedCapacity, setCalculatedCapacity] = useState<number | null>(null);
    const [maxFlights, setMaxFlights] = useState<number | null>(null);
    const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0); // 仿真进度

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: parseFloat(value),
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setSimulationResults([]);
        setCalculatedCapacity(null);
        setMaxFlights(null);
        setProgress(0);

        try {
            const iterations = 1000;
            await runMonteCarloSimulation(formData, iterations, (result: SimulationResult) => {
                setSimulationResults(prevResults => {
                    const updatedResults = [...prevResults, result];

                    // 更新进度
                    setProgress((updatedResults.length / iterations) * 100);

                    // 计算当前的平均容量
                    const totalCapacity = updatedResults.reduce((acc, res) => acc + res.capacity, 0);
                    const currentMeanCapacity = totalCapacity / updatedResults.length;
                    const maxFlightsByVolume = Math.floor(formData.availableVolume / formData.aircraftVolume);
                    const finalCapacity = Math.min(currentMeanCapacity, maxFlightsByVolume);

                    setCalculatedCapacity(currentMeanCapacity);
                    setMaxFlights(finalCapacity);

                    return updatedResults;
                });
            });


            setLoading(false);
        } catch (error) {
            console.error('计算时出错:', error);
            alert('计算时出错');
            setLoading(false);
        }
    };

    const handleBack = () => {
        window.history.back();
    };

    // 配置3D散点图数据
    const chartData = {
        x: simulationResults.map(result => result.safetyInterval),
        y: simulationResults.map(result => result.safetyFactor),
        z: simulationResults.map(result => result.capacity),
        mode: 'markers',
        type: 'scatter3d',
        marker: {
            size: 3,
            color: simulationResults.map(result => result.capacity),
            colorscale: 'Viridis',
            opacity: 0.8,
        },
    };

    const chartLayout = {
        title: '蒙特卡洛仿真结果分布',
        scene: {
            xaxis: { title: '安全间隔 (公里)' },
            yaxis: { title: '安全系数 (f)' },
            zaxis: { title: '容量 (架次/小时)' },
        },
        height: 600,
        width: 800,
    };

    return (
        <div className="calculation-container">
            <form onSubmit={handleSubmit} className="calculation-form">
                <div className="form-group">
                    <label htmlFor="availableVolume">可用容量 (V):</label>
                    <input
                        type="number"
                        id="availableVolume"
                        name="availableVolume"
                        value={formData.availableVolume}
                        onChange={handleChange}
                        required
                        min="1"
                        step="1"
                    />
                    <span className="unit">立方米</span>
                </div>
                <div className="form-group">
                    <label htmlFor="aircraftVolume">单架飞机占用的空域体积:</label>
                    <input
                        type="number"
                        id="aircraftVolume"
                        name="aircraftVolume"
                        value={formData.aircraftVolume}
                        onChange={handleChange}
                        required
                        min="1"
                        step="1"
                    />
                    <span className="unit">立方米</span>
                </div>
                <div className="form-group">
                    <label htmlFor="safetyInterval">安全间隔 (Δ):</label>
                    <input
                        type="number"
                        id="safetyInterval"
                        name="safetyInterval"
                        value={formData.safetyInterval}
                        onChange={handleChange}
                        required
                        min="0.1"
                        step="0.1"
                    />
                    <span className="unit">公里</span>
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
                        min="0.1"
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
                <div className="form-actions">
                    <button type="submit" disabled={loading}>
                        {loading ? '计算中...' : '计算容量'}
                    </button>
                    <button type="button" className="back-button" onClick={handleBack}>
                        返回
                    </button>
                </div>
                {loading && (
                    <div className="progress">
                        <progress value={progress} max="100"></progress>
                        <span>{progress.toFixed(2)}%</span>
                    </div>
                )}
                {calculatedCapacity !== null && maxFlights !== null && (
                    <div className="result">
                        <h3>计算的平均容量: {calculatedCapacity.toFixed(2)} 架次/小时</h3>
                        <h3>根据可用容量限制，最大架次: {Math.floor(maxFlights)} 架次/小时</h3>
                    </div>
                )}
            </form>
            {simulationResults.length > 0 && (
                <div className="chart-container">
                    <Plot
                        data={[chartData]}
                        layout={chartLayout}
                        config={{ responsive: true }}
                    />
                </div>
            )}
        </div>
    );
};

export default KeyParameterCalculation;
