import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:users',
      order: 0,
      title: $t('page.userComparison.title'),
    },
    name: 'UserComparison',
    path: '/user-comparison',
    component: () => import('#/views/user-comparison/index.vue'),
  },
];

export default routes;
