<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElSpace,
  ElTable,
  ElTag,
} from 'element-plus';

defineOptions({ name: 'OrderManagement' });

interface OrderItem {
  id: number;
  orderNo: string;
  submitTime: string;
  userUid: string;
  amount: number;
  payMethod: 'alipay' | 'none' | 'unionpay' | 'wechat';
  orderSource: 'app' | 'h5' | 'web';
}

type TagType = 'danger' | 'info' | 'primary' | 'success' | 'warning';

const payMethodMap: Record<string, { label: string; type: TagType }> = {
  none: { label: '未支付', type: 'danger' },
  alipay: { label: '支付宝', type: 'primary' },
  wechat: { label: '微信', type: 'success' },
  unionpay: { label: '云闪付', type: 'warning' },
};

const orderSourceMap: Record<string, string> = {
  app: 'APP订单',
  h5: 'H5订单',
  web: 'WEB订单',
};

const mockOrderList: OrderItem[] = [
  { id: 1, orderNo: 'ORD202401010001', submitTime: '2024-01-01 10:30:00', userUid: 'U10001', amount: 299.00, payMethod: 'alipay', orderSource: 'app' },
  { id: 2, orderNo: 'ORD202401010002', submitTime: '2024-01-01 11:45:00', userUid: 'U10002', amount: 599.00, payMethod: 'wechat', orderSource: 'h5' },
  { id: 3, orderNo: 'ORD202401020001', submitTime: '2024-01-02 09:15:00', userUid: 'U10003', amount: 1299.00, payMethod: 'unionpay', orderSource: 'web' },
  { id: 4, orderNo: 'ORD202401020002', submitTime: '2024-01-02 14:20:00', userUid: 'U10001', amount: 199.00, payMethod: 'none', orderSource: 'app' },
  { id: 5, orderNo: 'ORD202401030001', submitTime: '2024-01-03 16:30:00', userUid: 'U10004', amount: 899.00, payMethod: 'alipay', orderSource: 'h5' },
  { id: 6, orderNo: 'ORD202401030002', submitTime: '2024-01-03 18:00:00', userUid: 'U10005', amount: 4599.00, payMethod: 'wechat', orderSource: 'web' },
  { id: 7, orderNo: 'ORD202401040001', submitTime: '2024-01-04 08:45:00', userUid: 'U10002', amount: 799.00, payMethod: 'unionpay', orderSource: 'app' },
  { id: 8, orderNo: 'ORD202401040002', submitTime: '2024-01-04 12:10:00', userUid: 'U10006', amount: 399.00, payMethod: 'alipay', orderSource: 'h5' },
  { id: 9, orderNo: 'ORD202401050001', submitTime: '2024-01-05 15:25:00', userUid: 'U10003', amount: 1599.00, payMethod: 'wechat', orderSource: 'web' },
  { id: 10, orderNo: 'ORD202401050002', submitTime: '2024-01-05 19:50:00', userUid: 'U10007', amount: 699.00, payMethod: 'none', orderSource: 'app' },
];

const searchForm = reactive({
  orderNo: '',
  userUid: '',
  dateRange: [] as [Date, Date] | [],
});

const tableData = ref<OrderItem[]>([...mockOrderList]);

const filteredData = computed(() => {
  let result = [...tableData.value];

  if (searchForm.orderNo) {
    result = result.filter((item) =>
      item.orderNo.toLowerCase().includes(searchForm.orderNo.toLowerCase()),
    );
  }

  if (searchForm.userUid) {
    result = result.filter((item) =>
      item.userUid.toLowerCase().includes(searchForm.userUid.toLowerCase()),
    );
  }

  if (searchForm.dateRange && searchForm.dateRange.length === 2 && searchForm.dateRange[0] && searchForm.dateRange[1]) {
    const startDate = new Date(searchForm.dateRange[0]);
    const endDate = new Date(searchForm.dateRange[1]);
    endDate.setHours(23, 59, 59, 999);
    result = result.filter((item) => {
      const itemDate = new Date(item.submitTime);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  return result;
});

function handleSearch() {
  ElMessage.success(`查询完成，共 ${filteredData.value.length} 条记录`);
}

function handleReset() {
  searchForm.orderNo = '';
  searchForm.userUid = '';
  searchForm.dateRange = [];
}

const currentOrder = ref<OrderItem | null>(null);

const [Drawer, drawerApi] = useVbenDrawer({
  onOpenChange: (isOpen) => {
    if (!isOpen) {
      currentOrder.value = null;
    }
  },
});

function handleViewOrder(row: OrderItem) {
  currentOrder.value = row;
  drawerApi.open();
}

function handleDeleteOrder(row: OrderItem) {
  ElMessageBox.confirm(
    `确定要删除订单 "${row.orderNo}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  ).then(() => {
    const index = tableData.value.findIndex((item) => item.id === row.id);
    if (index > -1) {
      tableData.value.splice(index, 1);
      ElMessage.success('订单删除成功');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

function getPayMethodInfo(payMethod: string) {
  return payMethodMap[payMethod] || { label: '未知', type: 'info' as TagType };
}
</script>

<template>
  <Page
    description="管理系统中的所有订单信息"
    title="订单管理"
  >
    <Drawer class="w-[500px]" title="订单详情">
      <div v-if="currentOrder" class="p-4">
        <div class="mb-4 border-b pb-4">
          <h3 class="mb-2 text-lg font-semibold">基本信息</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">订单编号：</span>
              <span>{{ currentOrder.orderNo }}</span>
            </div>
            <div>
              <span class="text-gray-500">用户UID：</span>
              <span>{{ currentOrder.userUid }}</span>
            </div>
            <div>
              <span class="text-gray-500">提交时间：</span>
              <span>{{ currentOrder.submitTime }}</span>
            </div>
            <div>
              <span class="text-gray-500">订单金额：</span>
              <span class="text-lg font-semibold text-red-500">¥{{ currentOrder.amount.toFixed(2) }}</span>
            </div>
            <div>
              <span class="text-gray-500">支付方式：</span>
              <ElTag :type="getPayMethodInfo(currentOrder.payMethod).type">
                {{ getPayMethodInfo(currentOrder.payMethod).label }}
              </ElTag>
            </div>
            <div>
              <span class="text-gray-500">订单来源：</span>
              <span>{{ orderSourceMap[currentOrder.orderSource] }}</span>
            </div>
          </div>
        </div>
        <div class="mb-4 border-b pb-4">
          <h3 class="mb-2 text-lg font-semibold">订单状态</h3>
          <div class="text-sm">
            <ElTag v-if="currentOrder.payMethod === 'none'" type="danger">待支付</ElTag>
            <ElTag v-else type="success">已支付</ElTag>
          </div>
        </div>
        <div>
          <h3 class="mb-2 text-lg font-semibold">其他信息</h3>
          <div class="text-sm text-gray-500">
            <p>订单ID：{{ currentOrder.id }}</p>
            <p class="mt-2">创建时间：{{ currentOrder.submitTime }}</p>
          </div>
        </div>
      </div>
    </Drawer>

    <ElCard class="mb-4">
      <template #header>
        <span class="font-semibold">筛选条件</span>
      </template>
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center">
          <span class="mr-2 w-20 text-sm">订单编号：</span>
          <ElInput
            v-model="searchForm.orderNo"
            placeholder="请输入订单编号"
            clearable
            class="w-52"
          />
        </div>
        <div class="flex items-center">
          <span class="mr-2 w-20 text-sm">用户UID：</span>
          <ElInput
            v-model="searchForm.userUid"
            placeholder="请输入用户UID"
            clearable
            class="w-52"
          />
        </div>
        <div class="flex items-center">
          <span class="mr-2 w-20 text-sm">提交时间：</span>
          <ElDatePicker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="w-72"
          />
        </div>
        <ElSpace>
          <ElButton type="primary" @click="handleSearch">查找</ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </ElSpace>
      </div>
    </ElCard>

    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">订单列表</span>
          <span class="text-sm text-gray-500">共 {{ filteredData.length }} 条记录</span>
        </div>
      </template>
      <ElTable :data="filteredData" stripe border style="width: 100%">
        <ElTable.TableColumn type="index" label="编号" width="60" />
        <ElTable.TableColumn prop="orderNo" label="订单编号" min-width="160" />
        <ElTable.TableColumn prop="submitTime" label="提交时间" min-width="160" />
        <ElTable.TableColumn prop="userUid" label="用户UID" min-width="100" />
        <ElTable.TableColumn label="订单金额" min-width="100">
          <template #default="{ row }">
            <span class="font-semibold text-red-500">¥{{ row.amount.toFixed(2) }}</span>
          </template>
        </ElTable.TableColumn>
        <ElTable.TableColumn label="支付方式" min-width="100">
          <template #default="{ row }">
            <ElTag :type="getPayMethodInfo(row.payMethod).type">
              {{ getPayMethodInfo(row.payMethod).label }}
            </ElTag>
          </template>
        </ElTable.TableColumn>
        <ElTable.TableColumn label="订单来源" min-width="100">
          <template #default="{ row }">
            {{ orderSourceMap[row.orderSource] }}
          </template>
        </ElTable.TableColumn>
        <ElTable.TableColumn label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <ElSpace>
              <ElButton type="primary" size="small" @click="handleViewOrder(row)">
                查看订单
              </ElButton>
              <ElButton type="danger" size="small" @click="handleDeleteOrder(row)">
                删除订单
              </ElButton>
            </ElSpace>
          </template>
        </ElTable.TableColumn>
      </ElTable>
    </ElCard>
  </Page>
</template>
