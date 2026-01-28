export interface UserListItem {
  uid: string;
  nickname: string;
  username: string;
  lastLoginTime: string;
  lastLoginIp: string;
  monthlyLoginCount: number;
  registerTime: string;
  status: 'active' | 'frozen';
}

export interface UserListParams {
  uid?: string;
  nickname?: string;
  username?: string;
  lastLoginTimeStart?: string;
  lastLoginTimeEnd?: string;
  lastLoginIp?: string;
  monthlyLoginCountMin?: number;
  monthlyLoginCountMax?: number;
  registerTimeStart?: string;
  registerTimeEnd?: string;
  page?: number;
  pageSize?: number;
}