export interface User {
    id: number;
    username: string;
    password: string;
    email: string;
    phone: string;
    role: 'ADMIN' | 'USER';  // 用户角色
    status: 'ACTIVE' | 'BLOCKED';  // 用户状态
  }