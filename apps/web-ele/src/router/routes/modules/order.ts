import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:shopping-cart',
      order: 10,
      title: $t('page.order.title'),
    },
    name: 'Order',
    path: '/order',
    children: [
      {
        name: 'OrderList',
        path: '/order/list',
        component: () => import('#/views/order/list.vue'),
        meta: {
          icon: 'lucide:list',
          title: $t('page.order.list'),
        },
      },
    ],
  },
];

export default routes;
