// AirspaceCapacityForm.tsx

import React, { useState } from 'react';
import {
  Form,
  InputNumber,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  Space,
  Tooltip,
  message,
  Card,
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  ArrowLeftOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { jStat } from 'jstat';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface FormData {
  availableVolume: number;
  safetyInterval: number;
  safetyFactor: number;
  restrictedAirspaceRatio: number;
  efficiencyFactor: number;
  aircraftVolume: number;
  speedCombinations: SpeedCombination[];
}

interface SpeedCombination {
  v1: number;
  v2: number;
}

function AirspaceCapacityForm() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [calculatedCapacity, setCalculatedCapacity] = useState<number | null>(null);
  const [maxFlights, setMaxFlights] = useState<number | null>(null);

  const initialValues: FormData = {
    availableVolume: 1000,
    aircraftVolume: 50,
    safetyInterval: 1.5,
    safetyFactor: 1.0,
    restrictedAirspaceRatio: 0.01,
    efficiencyFactor: 1.0,
    speedCombinations: [
      { v1: 280, v2: 310 },
      { v1: 280, v2: 260 },
      { v1: 280, v2: 230 },
      { v1: 240, v2: 310 },
      { v1: 240, v2: 260 },
      { v1: 240, v2: 230 },
      { v1: 210, v2: 310 },
      { v1: 210, v2: 260 },
      { v1: 210, v2: 230 },
    ],
  };

  const onFinish = async (values: FormData) => {
    try {
      const capacity = calculateCapacity(values);
      const maxFlightsByVolume = Math.floor(values.availableVolume / values.aircraftVolume);
      const finalCapacity = Math.min(capacity, maxFlightsByVolume);

      const airspaceCapacityDTO = {
        ...values,
        calculatedCapacity: capacity,
        maxFlights: finalCapacity,
      };

      // 发送计算结果到后端（根据您的实际情况调整 URL）
      await axios.post(
          'http://localhost:8080/airspace/airspaceCapacity/calculate',
          airspaceCapacityDTO
      );

      setCalculatedCapacity(capacity);
      setMaxFlights(finalCapacity);
    } catch (error) {
      console.error('计算时出错:', error);
      message.error('计算时出错');
    }
  };

  // 计算容量的函数
  const calculateCapacity = (data: FormData): number => {
    const delta_ij = data.safetyInterval;
    const gamma = 20;
    const f = data.safetyFactor;
    const Rb = data.restrictedAirspaceRatio;
    const E = data.efficiencyFactor;

    const base_sigma_o = 10;
    const sigma_o = base_sigma_o / f;

    const pv = Rb;
    const qv = 1 - pv;

    const Tm = 1;
    const sigma_o_in_hours = sigma_o / 3600;

    const Phi_inv_qv = jStat.normal.inv(qv, 0, 1);

    const num_combinations = data.speedCombinations.length;
    if (num_combinations === 0) {
      return 0;
    }
    const P_ij = 1 / num_combinations;

    const T_ij_list: number[] = [];

    data.speedCombinations.forEach((combo) => {
      const v_i = combo.v1;
      const v_j = combo.v2;

      let IT_ij: number;
      if (v_i <= v_j) {
        IT_ij = delta_ij / v_j + sigma_o_in_hours * Phi_inv_qv;
      } else {
        IT_ij =
            delta_ij / v_j +
            (gamma - delta_ij) * (1 / v_j - 1 / v_i) +
            sigma_o_in_hours * Phi_inv_qv;
      }
      T_ij_list.push(IT_ij);
    });

    const denominator = T_ij_list.reduce((acc, T_ij) => acc + P_ij * T_ij, 0);
    if (denominator === 0) {
      return 0;
    }
    let C = Tm / denominator;
    C = C * E;

    return C;
  };

  return (
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center' }}>
          空域容量计算表单
        </Title>
        <Form
            form={form}
            layout="horizontal"
            onFinish={onFinish}
            initialValues={initialValues}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
        >
          <Card title="基本参数" bordered={false} style={{ marginBottom: '20px' }}>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                    name="availableVolume"
                    label={
                      <span>
                    可用容量 (V)
                    <Tooltip title="单位：立方米">
                      <InfoCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                    }
                    rules={[{ required: true, message: '请输入可用容量' }]}
                >
                  <InputNumber min={1} step={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                    name="aircraftVolume"
                    label={
                      <span>
                    单架飞机占用的空域体积
                    <Tooltip title="单位：立方米">
                      <InfoCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                    }
                    rules={[{ required: true, message: '请输入单架飞机占用的空域体积' }]}
                >
                  <InputNumber min={1} step={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                    name="safetyInterval"
                    label={
                      <span>
                    安全间隔 (Δ)
                    <Tooltip title="单位：公里">
                      <InfoCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                    }
                    rules={[{ required: true, message: '请输入安全间隔' }]}
                >
                  <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                    name="safetyFactor"
                    label="安全系数 (f)"
                    rules={[{ required: true, message: '请输入安全系数' }]}
                >
                  <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                    name="restrictedAirspaceRatio"
                    label="限制空域比率 (Rb)"
                    rules={[{ required: true, message: '请输入限制空域比率' }]}
                >
                  <InputNumber min={0} max={1} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                    name="efficiencyFactor"
                    label="效率系数 (E)"
                    rules={[{ required: true, message: '请输入效率系数' }]}
                >
                  <InputNumber min={0} max={1} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="速度组合 (v₁, v₂)" bordered={false}>
            <Form.List name="speedCombinations">
              {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                        <Row gutter={16} key={key} align="middle">
                          <Col span={10}>
                            <Form.Item
                                {...restField}
                                name={[name, 'v1']}
                                label="v₁ (km/h)"
                                rules={[{ required: true, message: '请输入 v₁' }]}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 16 }}
                            >
                              <InputNumber min={0} step={1} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>

                          <Col span={10}>
                            <Form.Item
                                {...restField}
                                name={[name, 'v2']}
                                label="v₂ (km/h)"
                                rules={[{ required: true, message: '请输入 v₂' }]}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 16 }}
                            >
                              <InputNumber min={0} step={1} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>

                          <Col span={4}>
                            <Button
                                type="text"
                                icon={<MinusCircleOutlined />}
                                onClick={() => remove(name)}
                                danger
                            >
                              移除
                            </Button>
                          </Col>
                        </Row>
                    ))}
                    <Form.Item wrapperCol={{ span: 24 }}>
                      <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                          style={{ width: '60%', margin: '0 auto' }}
                      >
                        添加速度组合
                      </Button>
                    </Form.Item>
                  </>
              )}
            </Form.List>
          </Card>

          <Form.Item wrapperCol={{ span: 24 }} style={{ textAlign: 'center', marginTop: '20px' }}>
            <Space size="large">
              <Button type="primary" htmlType="submit" size="large">
                计算容量
              </Button>
              <Button
                  onClick={() => window.history.back()}
                  icon={<ArrowLeftOutlined />}
                  size="large"
              >
                返回
              </Button>
              <Button
                  onClick={() => navigate('/history')}
                  icon={<HistoryOutlined />}
                  size="large"
              >
                历史记录
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {calculatedCapacity !== null && maxFlights !== null && (
            <Card
                title="计算结果"
                bordered={false}
                style={{ marginTop: '20px', textAlign: 'center' }}
            >
              <Typography>
                <Title level={4}>计算的容量: {calculatedCapacity.toFixed(2)} 架次/小时</Title>
                <Title level={4}>
                  根据可用容量限制，最大架次: {Math.floor(maxFlights)} 架次/小时
                </Title>
              </Typography>
            </Card>
        )}
      </div>
  );
}

export default AirspaceCapacityForm;