import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:shopping-cart',
      order: 0,
      title: $t('page.order.title'),
    },
    name: 'Order',
    path: '/order',
    children: [
      {
        name: 'OrderManagement',
        path: '/order/management',
        component: () => import('#/views/order/index.vue'),
        meta: {
          icon: 'lucide:list',
          title: $t('page.order.management'),
        },
      },
    ],
  },
];

export default routes;
