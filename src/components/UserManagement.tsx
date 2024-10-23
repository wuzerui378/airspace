import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message } from 'antd';
import axios from 'axios';
import { User } from '../types/User';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取所有用户
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/airspace/users/admin');
      setUsers(response.data);
    } catch (error) {
      message.error('获取用户列表失败');
    }
    setLoading(false);
  };

  // 删除用户
  const handleDeleteUser = async (userId: number) => {
    try {
      await axios.delete('http://localhost:8080/airspace/users/admin/delete', {
        params: { userId }
      });
      message.success('用户删除成功');
      fetchUsers();
    } catch (error) {
      message.error('删除用户失败');
    }
  };

  // 拉黑/解除拉黑用户
  const handleToggleBlock = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await axios.put('http://localhost:8080/airspace/users/admin/status', null, {
        params: {
          userId,
          status: newStatus
        },
      });
      message.success(`用户${newStatus === 'BLOCKED' ? '拉黑' : '解除拉黑'}成功`);
      fetchUsers();
    } catch (error) {
      message.error('操作失败');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ color: status === 'BLOCKED' ? 'red' : 'green' }}>
          {status === 'BLOCKED' ? '已拉黑' : '正常'}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <div>
          <Button 
            type="primary" 
            danger={record.status === 'ACTIVE'}
            onClick={() => handleToggleBlock(record.id, record.status)}
            style={{ marginRight: '8px' }}
          >
            {record.status === 'ACTIVE' ? '拉黑' : '解除拉黑'}
          </Button>
          <Button 
            type="primary" 
            danger 
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: `确定要删除用户 ${record.username} 吗？`,
                onOk: () => handleDeleteUser(record.id)
              });
            }}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="user-management">
      <h2>用户管理</h2>
      <Table 
        columns={columns} 
        dataSource={users} 
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default UserManagement;