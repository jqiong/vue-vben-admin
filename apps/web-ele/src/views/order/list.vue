<script lang="ts" setup>
import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import {
  ElButton,
  ElDatePicker,
  ElDescriptions,
  ElDescriptionsItem,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElSpace,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { $t } from '#/locales';

import {
  type Order,
  getMockOrders,
} from './data';

const mockData = getMockOrders();
const orders = ref<Order[]>([...mockData]);
const filterForm = ref({
  orderNo: '',
  submitTime: '',
  userUid: '',
});

const [Drawer, drawerApi] = useVbenDrawer();
const currentOrder = ref<Order | null>(null);

const payTypeMap: Record<number, string> = {
  0: '未支付',
  1: '支付宝',
  2: '微信',
  3: '云闪付',
};

const orderSourceMap: Record<number, string> = {
  1: 'APP订单',
  2: 'H5订单',
  3: 'WEB订单',
};

function handleSearch() {
  const { orderNo, submitTime, userUid } = filterForm.value;

  let filtered = [...mockData];

  if (orderNo) {
    filtered = filtered.filter((item) =>
      item.orderNo.toLowerCase().includes(orderNo.toLowerCase()),
    );
  }

  if (userUid) {
    filtered = filtered.filter((item) =>
      item.userUid.toLowerCase().includes(userUid.toLowerCase()),
    );
  }

  if (submitTime && Array.isArray(submitTime) && submitTime.length === 2) {
    const [start, end] = submitTime;
    if (start && end) {
      filtered = filtered.filter((item) => {
        const time = new Date(item.submitTime).getTime();
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        return time >= startTime && time <= endTime;
      });
    }
  }

  orders.value = filtered;
  ElMessage.success(`找到 ${filtered.length} 条记录`);
}

function handleReset() {
  filterForm.value = {
    orderNo: '',
    submitTime: '',
    userUid: '',
  };
  orders.value = [...mockData];
}

function handleView(row: Order) {
  currentOrder.value = row;
  drawerApi.open();
}

function handleDelete(row: Order) {
  ElMessageBox.confirm(`确定要删除订单 ${row.orderNo} 吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const index = orders.value.findIndex((item) => item.id === row.id);
      if (index > -1) {
        orders.value.splice(index, 1);
      }
      ElMessage.success('删除成功');
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
}

function formatPayType(val: number) {
  return payTypeMap[val] || '未知';
}

function formatOrderSource(val: number) {
  return orderSourceMap[val] || '未知';
}
</script>

<template>
  <Page>
    <Drawer class="w-[600px]" title="订单详情">
      <ElDescriptions :column="1" border v-if="currentOrder">
        <ElDescriptionsItem label="编号">
          {{ currentOrder.id }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="订单编号">
          {{ currentOrder.orderNo }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="提交时间">
          {{ currentOrder.submitTime }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="用户UID">
          {{ currentOrder.userUid }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="订单金额">
          ¥{{ currentOrder.amount.toFixed(2) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="支付方式">
          {{ formatPayType(currentOrder.payType) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="订单来源">
          {{ formatOrderSource(currentOrder.orderSource) }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </Drawer>

    <div class="p-4 bg-white rounded-md mb-4">
      <ElForm :inline="true" :model="filterForm" class="demo-form-inline">
        <ElFormItem label="订单编号">
          <ElInput
            v-model="filterForm.orderNo"
            placeholder="请输入订单编号"
            clearable
          />
        </ElFormItem>
        <ElFormItem label="提交时间">
          <ElDatePicker
            v-model="filterForm.submitTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </ElFormItem>
        <ElFormItem label="用户UID">
          <ElInput
            v-model="filterForm.userUid"
            placeholder="请输入用户UID"
            clearable
          />
        </ElFormItem>
        <ElFormItem>
          <ElSpace>
            <ElButton type="primary" @click="handleSearch">查找</ElButton>
            <ElButton @click="handleReset">重置</ElButton>
          </ElSpace>
        </ElFormItem>
      </ElForm>
    </div>

    <div class="bg-white rounded-md">
      <ElTable :data="orders" border stripe>
        <ElTableColumn prop="id" label="编号" width="80" />
        <ElTableColumn prop="orderNo" label="订单编号" min-width="180" />
        <ElTableColumn prop="submitTime" label="提交时间" width="180" />
        <ElTableColumn prop="userUid" label="用户UID" width="120" />
        <ElTableColumn prop="amount" label="订单金额" width="120">
          <template #default="{ row }">
            ¥{{ row.amount.toFixed(2) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="payType" label="支付方式" width="120">
          <template #default="{ row }">
            <ElTag v-if="row.payType === 0" type="info">
              {{ formatPayType(row.payType) }}
            </ElTag>
            <ElTag v-else-if="row.payType === 1" type="success">
              {{ formatPayType(row.payType) }}
            </ElTag>
            <ElTag v-else-if="row.payType === 2" type="warning">
              {{ formatPayType(row.payType) }}
            </ElTag>
            <ElTag v-else type="primary">
              {{ formatPayType(row.payType) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="orderSource" label="订单来源" width="120">
          <template #default="{ row }">
            <ElTag v-if="row.orderSource === 1" type="success">
              {{ formatOrderSource(row.orderSource) }}
            </ElTag>
            <ElTag v-else-if="row.orderSource === 2" type="primary">
              {{ formatOrderSource(row.orderSource) }}
            </ElTag>
            <ElTag v-else type="info">
              {{ formatOrderSource(row.orderSource) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <ElSpace>
              <ElButton link type="primary" @click="handleView(row)">
                查看
              </ElButton>
              <ElButton link type="danger" @click="handleDelete(row)">
                删除
              </ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </Page>
</template>
