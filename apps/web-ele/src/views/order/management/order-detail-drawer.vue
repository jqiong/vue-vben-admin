<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  ElButton,
  ElDescriptions,
  ElDescriptionsItem,
  ElTag,
} from 'element-plus';

// 订单数据类型定义
interface OrderItem {
  id: number;
  orderNo: string;
  submitTime: string;
  userId: string;
  amount: number;
  paymentMethod: 'unpaid' | 'alipay' | 'wechat' | 'unionpay';
  orderSource: 'app' | 'h5' | 'web';
}

// 支付方式标签映射
const paymentMethodTagMap: Record<string, { type: 'info' | 'success' | 'primary' | 'warning'; label: string }> = {
  alipay: { type: 'success', label: '支付宝' },
  unpaid: { type: 'info', label: '未支付' },
  unionpay: { type: 'warning', label: '云闪付' },
  wechat: { type: 'primary', label: '微信' },
};

// 订单来源标签映射
const orderSourceTagMap: Record<string, { type: 'info' | 'success' | 'primary'; label: string }> = {
  app: { type: 'success', label: 'APP订单' },
  h5: { type: 'primary', label: 'H5订单' },
  web: { type: 'info', label: 'WEB订单' },
};

// 抽屉数据
const orderData = ref<OrderItem | null>(null);

// 使用 useVbenDrawer
const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm() {
    drawerApi.close();
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      if (data && data.order) {
        orderData.value = data.order;
      }
    }
  },
});

// 格式化金额
function formatAmount(amount: number) {
  return `¥${amount.toFixed(2)}`;
}

// 获取支付方式标签信息
function getPaymentMethodInfo(method: string) {
  return paymentMethodTagMap[method] || { type: 'info' as const, label: '未知' };
}

// 获取订单来源标签信息
function getOrderSourceInfo(source: string) {
  return orderSourceTagMap[source] || { type: 'info' as const, label: '未知' };
}

defineOptions({ name: 'OrderDetailDrawer' });
</script>

<template>
  <Drawer
    :title="orderData ? `订单详情 - ${orderData.orderNo}` : '订单详情'"
    class="w-[600px]"
  >
    <div v-if="orderData" class="p-4">
      <ElDescriptions :column="1" border title="基本信息">
        <ElDescriptionsItem label="订单编号">
          <span class="font-mono">{{ orderData.orderNo }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="提交时间">
          {{ orderData.submitTime }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="用户UID">
          <span class="font-mono">{{ orderData.userId }}</span>
        </ElDescriptionsItem>
      </ElDescriptions>

      <ElDescriptions :column="1" border class="mt-4" title="支付信息">
        <ElDescriptionsItem label="订单金额">
          <span class="text-lg font-semibold text-red-500">
            {{ formatAmount(orderData.amount) }}
          </span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="支付方式">
          <ElTag :type="getPaymentMethodInfo(orderData.paymentMethod).type" size="small">
            {{ getPaymentMethodInfo(orderData.paymentMethod).label }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="订单来源">
          <ElTag :type="getOrderSourceInfo(orderData.orderSource).type" size="small">
            {{ getOrderSourceInfo(orderData.orderSource).label }}
          </ElTag>
        </ElDescriptionsItem>
      </ElDescriptions>

      <ElDescriptions :column="1" border class="mt-4" title="其他信息">
        <ElDescriptionsItem label="订单ID">
          <span class="font-mono text-gray-500">{{ orderData.id }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="备注">
          <span class="text-gray-500">暂无备注</span>
        </ElDescriptionsItem>
      </ElDescriptions>
    </div>

    <div v-else class="flex h-64 items-center justify-center text-gray-500">
      暂无订单数据
    </div>

    <template #footer>
      <div class="flex justify-end">
        <ElButton @click="drawerApi.close">关闭</ElButton>
      </div>
    </template>
  </Drawer>
</template>
