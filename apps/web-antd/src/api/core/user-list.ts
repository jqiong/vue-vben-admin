import type { UserListItem, UserListParams } from '#/types/user';

import { requestClient } from '#/api/request';

/**
 * 获取用户列表
 */
export async function getUserListApi(params: UserListParams) {
  return requestClient.post<{
    list: UserListItem[];
    total: number;
  }>('/user/list', params);
}

/**
 * 冻结用户
 */
export async function freezeUserApi(userId: string) {
  return requestClient.post('/user/freeze', { userId });
}

/**
 * 解冻用户
 */
export async function unfreezeUserApi(userId: string) {
  return requestClient.post('/user/unfreeze', { userId });
}