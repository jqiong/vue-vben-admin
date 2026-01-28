import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:users',
      order: 2,
      title: $t('page.userList.title'),
    },
    name: 'UserList',
    path: '/user-list',
    component: () => import('#/views/_core/user-list/index.vue'),
  },
];

export default routes;
