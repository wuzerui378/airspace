// src/utils/monteCarloSimulation.ts

import { jStat } from 'jstat';

export interface FormData {
    availableVolume: number; // V
    safetyInterval: number; // Δ
    safetyFactor: number; // f
    restrictedAirspaceRatio: number; // Rb
    efficiencyFactor: number; // E
    aircraftVolume: number; // 单架飞机占用的空域体积
}

export interface SimulationResult {
    safetyInterval: number;
    safetyFactor: number;
    restrictedAirspaceRatio: number;
    efficiencyFactor: number;
    capacity: number;
}

export const calculateCapacity = (data: FormData): number => {
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
            IT_ij = (
                delta_ij / v_j +
                (gamma - delta_ij) * (1 / v_j - 1 / v_i) +
                sigma_o_in_hours * Phi_inv_qv
            );
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

/**
 * 运行蒙特卡洛仿真，逐步生成结果并通过回调函数传递每一步的结果
 * @param data 表单数据
 * @param iterations 仿真次数
 * @param callback 每次仿真完成后的回调函数
 */
export const runMonteCarloSimulation = async (
    data: FormData,
    iterations: number,
    callback: (result: SimulationResult) => void
): Promise<void> => {
    for (let i = 0; i < iterations; i++) {
        // 引入随机性，例如安全间隔的波动
        const variedData: FormData = {
            ...data,
            safetyInterval: data.safetyInterval + jStat.normal.sample(0, 0.1), // 假设安全间隔有小幅波动
            safetyFactor: data.safetyFactor + jStat.normal.sample(0, 0.05), // 安全系数有小幅波动
            restrictedAirspaceRatio: data.restrictedAirspaceRatio + jStat.normal.sample(0, 0.005),
            efficiencyFactor: data.efficiencyFactor + jStat.normal.sample(0, 0.02),
        };

        // 确保参数在合理范围内
        variedData.safetyInterval = Math.max(0.1, variedData.safetyInterval);
        variedData.safetyFactor = Math.max(0.1, variedData.safetyFactor);
        variedData.restrictedAirspaceRatio = Math.min(Math.max(variedData.restrictedAirspaceRatio, 0), 1);
        variedData.efficiencyFactor = Math.min(Math.max(variedData.efficiencyFactor, 0), 1);

        const capacity = calculateCapacity(variedData);
        const result: SimulationResult = {
            safetyInterval: variedData.safetyInterval,
            safetyFactor: variedData.safetyFactor,
            restrictedAirspaceRatio: variedData.restrictedAirspaceRatio,
            efficiencyFactor: variedData.efficiencyFactor,
            capacity,
        };

        // 调用回调函数传递结果
        callback(result);

        // 使用微任务队列确保UI更新
        await new Promise(resolve => setTimeout(resolve, 0));
    }
};
