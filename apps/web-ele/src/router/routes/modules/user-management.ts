import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:users',
      order: 100,
      title: $t('page.userManagement.title'),
    },
    name: 'UserManagement',
    path: '/user-management',
    children: [
      {
        meta: {
          title: $t('page.userManagement.userList'),
        },
        name: 'UserList',
        path: '/user-management/user-list',
        component: () => import('#/views/user-management/user-list/index.vue'),
      },
    ],
  },
];

export default routes;
