import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-manage-accounts',
      keepAlive: true,
      order: 500,
      title: '系统管理',
    },
    name: 'System',
    path: '/system',
    children: [
      {
        meta: {
          title: '用户列表',
          icon: 'ic:baseline-people',
        },
        name: 'UserList',
        path: '/system/user-list',
        component: () => import('#/views/system/user-list/index.vue'),
      },
    ],
  },
];

export default routes;
