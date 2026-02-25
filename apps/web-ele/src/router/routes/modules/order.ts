import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:shopping-cart',
      order: 100,
      title: $t('page.order.title'),
    },
    name: 'Order',
    path: '/order',
    children: [
      {
        meta: {
          icon: 'lucide:list',
          title: $t('page.order.management'),
        },
        name: 'OrderManagement',
        path: '/order/management',
        component: () => import('#/views/order/management/index.vue'),
      },
    ],
  },
];

export default routes;
