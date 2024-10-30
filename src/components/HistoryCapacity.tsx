import React, { useState, useEffect } from 'react';
import { Table, message, Space, Button, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { DownloadOutlined, DeleteOutlined } from '@ant-design/icons';

interface AirspaceCapacity {
    id: number;
    availableVolume: number;
    safetyInterval: number;
    safetyFactor: number;
    restrictedAirspaceRatio: number;
    efficiencyFactor: number;
    aircraftVolume: number;
    calculatedCapacity: number;
    maxFlights: number;
    createTime: string;
}

interface TableParams {
    pagination: {
        current: number;
        pageSize: number;
    };
}

const HistoryCapacity: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<AirspaceCapacity[]>([]);

    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });

    const handleBack = () => {
        window.history.back();
    };

    // 导出Excel功能
    const exportToExcel = () => {
        // 准备Excel数据
        const excelData = data.map((item, index) => ({
            '序号': index + 1,
            '可用空域体积': item.availableVolume,
            '安全间隔': item.safetyInterval,
            '安全系数': item.safetyFactor,
            '限制空域比例': item.restrictedAirspaceRatio,
            '效率系数': item.efficiencyFactor,
            '单架飞机体积': item.aircraftVolume,
            '计算容量': item.calculatedCapacity,
            '最大航班数': item.maxFlights,
            '创建时间': new Date(item.createTime).toLocaleString()
        }));

        // 创建工作簿
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '空域容量历史记录');

        // 设置列宽
        const colWidths = [
            { wch: 6 },  // 序号
            { wch: 15 }, // 可用空域体积
            { wch: 10 }, // 安全间隔
            { wch: 10 }, // 安全系数
            { wch: 15 }, // 限制空域比例
            { wch: 10 }, // 效率系数
            { wch: 15 }, // 单架飞机体积
            { wch: 10 }, // 计算容量
            { wch: 12 }, // 最大航班数
            { wch: 20 }  // 创建时间
        ];
        ws['!cols'] = colWidths;

        // 导出文件
        XLSX.writeFile(wb, '空域容量历史记录.xlsx');
    };



    // 定义表格列
    const columns: ColumnsType<AirspaceCapacity> = [
        {
            title: '序号',
            key: 'index',
            width: 80,
            align: 'center',
            render: (_: any, __: any, index: number) => {
                return (tableParams.pagination.current - 1) * tableParams.pagination.pageSize + index + 1;
            },
            fixed: 'left'
        },
        {
            title: '可用空域体积',
            dataIndex: 'availableVolume',
            key: 'availableVolume',
            width: 120,
            align: 'center',
        },
        {
            title: '安全间隔',
            dataIndex: 'safetyInterval',
            key: 'safetyInterval',
            width: 100,
            align: 'center',
        },
        {
            title: '安全系数',
            dataIndex: 'safetyFactor',
            key: 'safetyFactor',
            width: 100,
            align: 'center',
        },
        {
            title: '限制空域比例',
            dataIndex: 'restrictedAirspaceRatio',
            key: 'restrictedAirspaceRatio',
            width: 120,
            align: 'center',
        },
        {
            title: '效率系数',
            dataIndex: 'efficiencyFactor',
            key: 'efficiencyFactor',
            width: 100,
            align: 'center',
        },
        {
            title: '单架飞机体积',
            dataIndex: 'aircraftVolume',
            key: 'aircraftVolume',
            width: 120,
            align: 'center',
        },
        {
            title: '计算容量',
            dataIndex: 'calculatedCapacity',
            key: 'calculatedCapacity',
            width: 100,
            align: 'center',
        },
        {
            title: '最大航班数',
            dataIndex: 'maxFlights',
            key: 'maxFlights',
            width: 100,
            align: 'center',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 180,
            align: 'center',
            render: (text: string) => {
                // 格式化时间显示
                const date = new Date(text);
                return date.toLocaleString();
            }
        }
    ];

    // 获取历史记录数据
    const fetchHistoryData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/airspace/airspaceCapacity/list');
            if (response.data.status === 'success') {
                setData(response.data.data);
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            console.error('获取历史记录失败:', error);
            message.error('获取历史记录失败');
        } finally {
            setLoading(false);
        }
    };
    // 删除所有记录
    const deleteAllRecords = async () => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除所有历史记录吗？此操作不可恢复！',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                try {
                    const response = await axios.delete('http://localhost:8080/airspace/airspaceCapacity/deleteAll');
                    if (response.data.status === 'success') {
                        message.success('删除成功');
                        // 刷新数据
                        fetchHistoryData();
                    } else {
                        message.error(response.data.message || '删除失败');
                    }
                } catch (error) {
                    console.error('删除失败:', error);
                    message.error('删除失败');
                }
            }
        });
    };

    // 组件挂载时获取数据
    useEffect(() => {
        fetchHistoryData();
    }, []);

    return (
        <div style={{ padding: '24px' }}>

            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={exportToExcel}
                >
                    导出Excel
                </Button>
                <Button 
                        danger
                        icon={<DeleteOutlined />} 
                        onClick={deleteAllRecords}
                    >
                        删除所有记录
                    </Button>
            </div>
            <Table<AirspaceCapacity>
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="id"
                scroll={{ x: 1300 }}
                pagination={{
                    total: data.length,
                    pageSize: 10,
                    showTotal: (total) => `共 ${total} 条记录`,
                }}
                bordered
                size="middle"
            />
            <button type="button" className="back-button" onClick={handleBack}>返回</button>
        </div>
    );
};

export default HistoryCapacity;