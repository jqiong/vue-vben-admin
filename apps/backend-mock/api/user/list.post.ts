import type { UserListItem, UserListParams } from '~/types/user';

import userData from '../data/users.json';

export default defineEventHandler(async (event) => {
  const body = await readBody<UserListParams>(event);
  
  const {
    uid,
    nickname,
    username,
    lastLoginTimeStart,
    lastLoginTimeEnd,
    lastLoginIp,
    monthlyLoginCountMin,
    monthlyLoginCountMax,
    registerTimeStart,
    registerTimeEnd,
    page = 1,
    pageSize = 10,
  } = body || {};

  // 过滤数据
  let filteredData = userData as UserListItem[];

  if (uid) {
    filteredData = filteredData.filter(user => user.uid.includes(uid));
  }
  if (nickname) {
    filteredData = filteredData.filter(user => user.nickname.includes(nickname));
  }
  if (username) {
    filteredData = filteredData.filter(user => user.username.includes(username));
  }
  if (lastLoginIp) {
    filteredData = filteredData.filter(user => user.lastLoginIp.includes(lastLoginIp));
  }
  if (monthlyLoginCountMin !== undefined) {
    filteredData = filteredData.filter(user => user.monthlyLoginCount >= monthlyLoginCountMin);
  }
  if (monthlyLoginCountMax !== undefined) {
    filteredData = filteredData.filter(user => user.monthlyLoginCount <= monthlyLoginCountMax);
  }
  if (lastLoginTimeStart) {
    filteredData = filteredData.filter(user => user.lastLoginTime >= lastLoginTimeStart);
  }
  if (lastLoginTimeEnd) {
    filteredData = filteredData.filter(user => user.lastLoginTime <= lastLoginTimeEnd);
  }
  if (registerTimeStart) {
    filteredData = filteredData.filter(user => user.registerTime >= registerTimeStart);
  }
  if (registerTimeEnd) {
    filteredData = filteredData.filter(user => user.registerTime <= registerTimeEnd);
  }

  // 分页
  const total = filteredData.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const list = filteredData.slice(start, end);

  return {
    code: 0,
    message: 'success',
    data: {
      list,
      total,
    },
  };
});