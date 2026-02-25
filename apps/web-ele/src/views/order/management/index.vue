<script lang="ts" setup>
import { reactive, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElSpace,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import OrderDetailDrawer from './order-detail-drawer.vue';

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

// 模拟订单数据
const mockOrderData: OrderItem[] = [
  {
    id: 1,
    orderNo: 'ORD202402250001',
    submitTime: '2024-02-25 10:30:00',
    userId: 'USER10001',
    amount: 299.99,
    paymentMethod: 'alipay',
    orderSource: 'app',
  },
  {
    id: 2,
    orderNo: 'ORD202402250002',
    submitTime: '2024-02-25 11:15:30',
    userId: 'USER10002',
    amount: 159.50,
    paymentMethod: 'wechat',
    orderSource: 'h5',
  },
  {
    id: 3,
    orderNo: 'ORD202402250003',
    submitTime: '2024-02-25 12:00:00',
    userId: 'USER10003',
    amount: 899.00,
    paymentMethod: 'unionpay',
    orderSource: 'web',
  },
  {
    id: 4,
    orderNo: 'ORD202402250004',
    submitTime: '2024-02-25 13:45:20',
    userId: 'USER10004',
    amount: 59.90,
    paymentMethod: 'unpaid',
    orderSource: 'app',
  },
  {
    id: 5,
    orderNo: 'ORD202402250005',
    submitTime: '2024-02-25 14:30:00',
    userId: 'USER10005',
    amount: 1299.00,
    paymentMethod: 'alipay',
    orderSource: 'web',
  },
  {
    id: 6,
    orderNo: 'ORD202402250006',
    submitTime: '2024-02-25 15:20:10',
    userId: 'USER10006',
    amount: 399.00,
    paymentMethod: 'wechat',
    orderSource: 'app',
  },
  {
    id: 7,
    orderNo: 'ORD202402250007',
    submitTime: '2024-02-25 16:00:00',
    userId: 'USER10007',
    amount: 79.99,
    paymentMethod: 'unionpay',
    orderSource: 'h5',
  },
  {
    id: 8,
    orderNo: 'ORD202402250008',
    submitTime: '2024-02-25 17:30:45',
    userId: 'USER10008',
    amount: 599.50,
    paymentMethod: 'alipay',
    orderSource: 'web',
  },
  {
    id: 9,
    orderNo: 'ORD202402250009',
    submitTime: '2024-02-25 18:15:00',
    userId: 'USER10009',
    amount: 199.00,
    paymentMethod: 'unpaid',
    orderSource: 'h5',
  },
  {
    id: 10,
    orderNo: 'ORD202402250010',
    submitTime: '2024-02-25 19:00:00',
    userId: 'USER10010',
    amount: 999.99,
    paymentMethod: 'wechat',
    orderSource: 'app',
  },
];

// 筛选表单数据
const searchForm = reactive({
  orderNo: '',
  userId: '',
  dateRange: [] as Date[],
});

// 表格数据
const tableData = ref<OrderItem[]>([...mockOrderData]);
const loading = ref(false);

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: mockOrderData.length,
});

// 当前选中的订单
const currentOrder = ref<OrderItem | null>(null);

// 抽屉组件
const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: OrderDetailDrawer,
});

// 查找按钮点击事件
function handleSearch() {
  loading.value = true;

  // 模拟筛选逻辑
  let filteredData = [...mockOrderData];

  if (searchForm.orderNo) {
    filteredData = filteredData.filter((item) =>
      item.orderNo.toLowerCase().includes(searchForm.orderNo.toLowerCase()),
    );
  }

  if (searchForm.userId) {
    filteredData = filteredData.filter((item) =>
      item.userId.toLowerCase().includes(searchForm.userId.toLowerCase()),
    );
  }

  if (searchForm.dateRange && searchForm.dateRange.length === 2 && searchForm.dateRange[0] && searchForm.dateRange[1]) {
    const startDate = searchForm.dateRange[0].getTime();
    const endDate = searchForm.dateRange[1].getTime();
    filteredData = filteredData.filter((item) => {
      const itemDate = new Date(item.submitTime).getTime();
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  // 模拟延迟
  setTimeout(() => {
    tableData.value = filteredData;
    pagination.total = filteredData.length;
    pagination.currentPage = 1;
    loading.value = false;
    ElMessage.success(`查询完成，共找到 ${filteredData.length} 条记录`);
  }, 300);
}

// 重置筛选
function handleReset() {
  searchForm.orderNo = '';
  searchForm.userId = '';
  searchForm.dateRange = [];
  tableData.value = [...mockOrderData];
  pagination.total = mockOrderData.length;
  pagination.currentPage = 1;
  ElMessage.info('已重置筛选条件');
}

// 查看订单
function handleViewOrder(row: OrderItem) {
  currentOrder.value = row;
  drawerApi.setData({ order: row });
  drawerApi.open();
}

// 删除订单
function handleDeleteOrder(row: OrderItem) {
  ElMessageBox.confirm(
    `确定要删除订单 "${row.orderNo}" 吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(() => {
      // 模拟删除操作
      const index = tableData.value.findIndex((item) => item.id === row.id);
      if (index > -1) {
        tableData.value.splice(index, 1);
        pagination.total = tableData.value.length;
        ElMessage.success('订单删除成功');
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
}

// 分页大小变化
function handleSizeChange(val: number) {
  pagination.pageSize = val;
}

// 页码变化
function handleCurrentChange(val: number) {
  pagination.currentPage = val;
}

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

defineOptions({ name: 'OrderManagement' });
</script>

<template>
  <Page :title="$t('page.order.management')">
    <!-- 筛选区域 -->
    <ElCard class="mb-4" shadow="never">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">订单编号:</span>
          <ElInput
            v-model="searchForm.orderNo"
            class="w-48"
            clearable
            placeholder="请输入订单编号"
            @keyup.enter="handleSearch"
          />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">用户UID:</span>
          <ElInput
            v-model="searchForm.userId"
            class="w-48"
            clearable
            placeholder="请输入用户UID"
            @keyup.enter="handleSearch"
          />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">提交时间:</span>
          <ElDatePicker
            v-model="searchForm.dateRange"
            :shortcuts="[
              {
                text: '今天',
                value: () => {
                  const end = new Date();
                  const start = new Date();
                  return [start, end];
                },
              },
              {
                text: '最近一周',
                value: () => {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                  return [start, end];
                },
              },
              {
                text: '最近一个月',
                value: () => {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                  return [start, end];
                },
              },
            ]"
            class="w-72"
            end-placeholder="结束日期"
            range-separator="至"
            start-placeholder="开始日期"
            type="daterange"
            value-format="YYYY-MM-DD"
          />
        </div>

        <ElSpace>
          <ElButton type="primary" @click="handleSearch">
            <span class="icon-[lucide--search] mr-1"></span>
            查找
          </ElButton>
          <ElButton @click="handleReset">
            <span class="icon-[lucide--rotate-ccw] mr-1"></span>
            重置
          </ElButton>
        </ElSpace>
      </div>
    </ElCard>

    <!-- 表格区域 -->
    <ElCard shadow="never">
      <ElTable
        v-loading="loading"
        :data="tableData.slice((pagination.currentPage - 1) * pagination.pageSize, pagination.currentPage * pagination.pageSize)"
        border
        stripe
        style="width: 100%"
      >
        <ElTableColumn align="center" label="编号" type="index" width="60" />

        <ElTableColumn label="订单编号" min-width="160" prop="orderNo">
          <template #default="{ row }">
            <span class="font-mono text-sm">{{ row.orderNo }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="提交时间" min-width="160" prop="submitTime">
          <template #default="{ row }">
            <span class="text-sm text-gray-600">{{ row.submitTime }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="用户UID" min-width="120" prop="userId">
          <template #default="{ row }">
            <span class="font-mono text-sm">{{ row.userId }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn align="right" label="订单金额" min-width="120" prop="amount">
          <template #default="{ row }">
            <span class="font-semibold text-red-500">{{ formatAmount(row.amount) }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn align="center" label="支付方式" min-width="120" prop="paymentMethod">
          <template #default="{ row }">
            <ElTag :type="getPaymentMethodInfo(row.paymentMethod).type" size="small">
              {{ getPaymentMethodInfo(row.paymentMethod).label }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn align="center" label="订单来源" min-width="120" prop="orderSource">
          <template #default="{ row }">
            <ElTag :type="getOrderSourceInfo(row.orderSource).type" size="small">
              {{ getOrderSourceInfo(row.orderSource).label }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn align="center" fixed="right" label="操作" width="180">
          <template #default="{ row }">
            <ElSpace>
              <ElButton link type="primary" @click="handleViewOrder(row)">
                <span class="icon-[lucide--eye] mr-1"></span>
                查看订单
              </ElButton>
              <ElButton link type="danger" @click="handleDeleteOrder(row)">
                <span class="icon-[lucide--trash-2] mr-1"></span>
                删除订单
              </ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <ElPagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>

    <!-- 订单详情抽屉 -->
    <Drawer />
  </Page>
</template>
