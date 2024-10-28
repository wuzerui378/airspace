import React, { useState, ChangeEvent, FormEvent } from 'react';
import '../static/AirspaceCapacityForm.css';
import { jStat } from 'jstat';

interface FormData {
    availableVolume: number; // V
    safetyInterval: number; // Δ
    safetyFactor: number; // f
    restrictedAirspaceRatio: number; // Rb
    efficiencyFactor: number; // E
    aircraftVolume: number; // 单架飞机占用的空域体积
}

function AirspaceCapacityForm() {
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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: parseFloat(value)
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const capacity = calculateCapacity(formData);
            const maxFlightsByVolume = Math.floor(formData.availableVolume / formData.aircraftVolume);
            const finalCapacity = Math.min(capacity, maxFlightsByVolume);
            setCalculatedCapacity(capacity);
            setMaxFlights(finalCapacity);
            alert(`计算的容量: ${capacity.toFixed(2)} 架次/小时\n根据可用容量限制，最大架次: ${finalCapacity} 架次/小时`);
        } catch (error) {
            console.error('计算时出错:', error);
            alert('计算时出错');
        }
    };

    const handleBack = () => {
        window.history.back();
    };

    // 计算容量的函数
    const calculateCapacity = (data: FormData): number => {
        // 定义飞机速度组合（单位：km/h）
        const combinations = [
            { v1: 280, v2: 310 },
            { v1: 280, v2: 260 },
            { v1: 280, v2: 230 },
            { v1: 240, v2: 310 },
            { v1: 240, v2: 260 },
            { v1: 240, v2: 230 },
            { v1: 210, v2: 310 },
            { v1: 210, v2: 260 },
            { v1: 210, v2: 230 },
        ];

        // 映射表单输入到计算参数
        const delta_ij = data.safetyInterval; // 最小允许间隔（公里）
        const gamma = 20; // 空投场公共运行长度（公里），固定为20 km
        const f = data.safetyFactor; // 安全系数
        const Rb = data.restrictedAirspaceRatio; // 限制空域比率
        const E = data.efficiencyFactor; // 效率系数

        // 基础参数设置
        const base_sigma_o = 10; // 占用时间的标准差（秒）
        const sigma_o = base_sigma_o / f; // 根据安全系数调整

        const pv = Rb; // 违反最小间隔的概率
        const qv = 1 - pv; // 安全间隔概率

        const Tm = 1; // 时间段，单位为小时

        // 将 sigma_o 转换为小时单位
        const sigma_o_in_hours = sigma_o / 3600; // 将秒转换为小时

        // 计算 Phi_inv_qv
        const Phi_inv_qv = jStat.normal.inv(qv, 0, 1);

        // 为每个组合分配相等的概率
        const num_combinations = combinations.length;
        const P_ij = 1 / num_combinations;

        // 计算每个组合的 T_ij 值
        const T_ij_list: number[] = [];

        combinations.forEach(combo => {
            const v_i = combo.v1; // 前机速度（km/h）
            const v_j = combo.v2; // 后机速度（km/h）

            let IT_ij: number;
            if (v_i <= v_j) {
                // 渐进态（前机速度小于等于后机）
                IT_ij = delta_ij / v_j + sigma_o_in_hours * Phi_inv_qv;
            } else {
                // 渐远态（前机速度大于后机）
                IT_ij = (delta_ij / v_j +
                    (gamma - delta_ij) * (1 / v_j - 1 / v_i) +
                    sigma_o_in_hours * Phi_inv_qv);
            }
            T_ij_list.push(IT_ij);
        });

        // 计算容量 C
        const denominator = T_ij_list.reduce((acc, T_ij) => acc + P_ij * T_ij, 0);
        let C = Tm / denominator;

        // 应用效率系数
        C = C * E;

        return C;
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
                <button type="submit">计算容量</button>
                <button type="button" className="back-button" onClick={handleBack}>返回</button>
            </div>
            {calculatedCapacity !== null && maxFlights !== null && (
                <div className="result">
                    <h3>计算的容量: {calculatedCapacity.toFixed(2)} 架次/小时</h3>
                    <h3>根据可用容量限制，最大架次: {maxFlights} 架次/小时</h3>
                </div>
            )}
        </form>
    );
}

export default AirspaceCapacityForm;
