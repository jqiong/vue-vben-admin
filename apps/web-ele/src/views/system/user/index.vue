<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElDialog,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElMessageBox,
  ElTag,
} from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import UserDetail from './detail.vue';

// 用户数据接口
interface UserRecord {
  uid: string;
  nickname: string;
  username: string;
  lastLoginTime: string;
  lastLoginIp: string;
  monthlyLoginCount: number;
  registerTime: string;
  frozen: boolean;
}

// 生成模拟数据
function generateMockData(): UserRecord[] {
  const data: UserRecord[] = [];
  const ips = [
    '192.168.1.100',
    '192.168.1.101',
    '10.0.0.50',
    '172.16.0.1',
    '203.0.113.1',
    '198.51.100.1',
    '192.0.2.1',
  ];

  // 2024年数据
  for (let i = 1; i <= 100; i++) {
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const registerMonth = Math.floor(Math.random() * 12) + 1;
    const registerDay = Math.floor(Math.random() * 28) + 1;

    data.push({
      uid: `2024${String(i).padStart(4, '0')}`,
      nickname: `用户${i}`,
      username: `user${i}`,
      lastLoginTime: `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      lastLoginIp: ips[Math.floor(Math.random() * ips.length)],
      monthlyLoginCount: Math.floor(Math.random() * 50) + 1,
      registerTime: `2024-${String(registerMonth).padStart(2, '0')}-${String(registerDay).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      frozen: Math.random() > 0.8,
    });
  }

  // 2025年数据
  for (let i = 1; i <= 100; i++) {
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const registerMonth = Math.floor(Math.random() * 12) + 1;
    const registerDay = Math.floor(Math.random() * 28) + 1;

    data.push({
      uid: `2025${String(i).padStart(4, '0')}`,
      nickname: `用户${i + 100}`,
      username: `user${i + 100}`,
      lastLoginTime: `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      lastLoginIp: ips[Math.floor(Math.random() * ips.length)],
      monthlyLoginCount: Math.floor(Math.random() * 50) + 1,
      registerTime: `2025-${String(registerMonth).padStart(2, '0')}-${String(registerDay).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      frozen: Math.random() > 0.8,
    });
  }

  return data;
}

const allData = ref<UserRecord[]>(generateMockData());
const filteredData = ref<UserRecord[]>([...allData.value]);

// 筛选表单
const filterSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'uid',
    label: 'UID',
    componentProps: {
      placeholder: '请输入UID',
      clearable: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'nickname',
    label: '昵称',
    componentProps: {
      placeholder: '请输入昵称',
      clearable: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'username',
    label: '用户名',
    componentProps: {
      placeholder: '请输入用户名',
      clearable: true,
    },
  },
  {
    component: 'Input',
    fieldName: 'lastLoginIp',
    label: '最近登录IP',
    componentProps: {
      placeholder: '请输入IP地址',
      clearable: true,
    },
  },
  {
    component: 'DatePicker',
    fieldName: 'lastLoginTimeRange',
    label: '最近登录时间',
    componentProps: {
      type: 'datetimerange',
      startPlaceholder: '开始时间',
      endPlaceholder: '结束时间',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
  },
  {
    component: 'InputNumber',
    fieldName: 'minLoginCount',
    label: '最小登录次数',
    componentProps: {
      placeholder: '最小值',
      min: 0,
    },
  },
  {
    component: 'InputNumber',
    fieldName: 'maxLoginCount',
    label: '最大登录次数',
    componentProps: {
      placeholder: '最大值',
      min: 0,
    },
  },
  {
    component: 'DatePicker',
    fieldName: 'registerTimeRange',
    label: '注册时间',
    componentProps: {
      type: 'datetimerange',
      startPlaceholder: '开始时间',
      endPlaceholder: '结束时间',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
  },
];

const [FilterForm, filterFormApi] = useVbenForm({
  schema: filterSchema,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  actionButtons: [
    {
      content: '查询',
      type: 'primary',
      onClick: handleSearch,
    },
    {
      content: '重置',
      onClick: handleReset,
    },
    {
      content: '导出',
      type: 'success',
      onClick: openExportDialog,
    },
  ],
});

// 导出对话框
const exportDialogVisible = ref(false);
const exportDateRange = ref<[string, string] | null>(null);

// 详情抽屉
const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: UserDetail,
});

const currentUser = ref<UserRecord | null>(null);

// 表格配置
const gridOptions = computed<VxeGridProps<UserRecord>>(() => ({
  columns: [
    { field: 'uid', title: 'UID', width: 120 },
    { field: 'nickname', title: '昵称', width: 120 },
    { field: 'username', title: '用户名', width: 120 },
    { field: 'lastLoginTime', title: '最近登录时间', width: 180 },
    { field: 'lastLoginIp', title: '最近登录IP', width: 140 },
    { field: 'monthlyLoginCount', title: '当月登录次数', width: 120 },
    { field: 'registerTime', title: '注册时间', width: 180 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 200,
    },
  ],
  data: filteredData.value,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
  },
  sortConfig: {
    multiple: true,
  },
}));

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 查询
async function handleSearch() {
  const values = await filterFormApi.getValues();

  filteredData.value = allData.value.filter((item) => {
    // UID筛选
    if (values.uid && !item.uid.includes(values.uid)) {
      return false;
    }

    // 昵称筛选
    if (values.nickname && !item.nickname.includes(values.nickname)) {
      return false;
    }

    // 用户名筛选
    if (values.username && !item.username.includes(values.username)) {
      return false;
    }

    // IP筛选
    if (values.lastLoginIp && !item.lastLoginIp.includes(values.lastLoginIp)) {
      return false;
    }

    // 最近登录时间范围筛选
    if (values.lastLoginTimeRange && values.lastLoginTimeRange.length === 2) {
      const itemTime = new Date(item.lastLoginTime).getTime();
      const startTime = new Date(values.lastLoginTimeRange[0]).getTime();
      const endTime = new Date(values.lastLoginTimeRange[1]).getTime();
      if (itemTime < startTime || itemTime > endTime) {
        return false;
      }
    }

    // 登录次数范围筛选
    if (values.minLoginCount !== undefined && item.monthlyLoginCount < values.minLoginCount) {
      return false;
    }
    if (values.maxLoginCount !== undefined && item.monthlyLoginCount > values.maxLoginCount) {
      return false;
    }

    // 注册时间范围筛选
    if (values.registerTimeRange && values.registerTimeRange.length === 2) {
      const itemTime = new Date(item.registerTime).getTime();
      const startTime = new Date(values.registerTimeRange[0]).getTime();
      const endTime = new Date(values.registerTimeRange[1]).getTime();
      if (itemTime < startTime || itemTime > endTime) {
        return false;
      }
    }

    return true;
  });

  gridApi.setGridOptions({ data: filteredData.value });
  ElMessage.success(`查询完成，共找到 ${filteredData.value.length} 条记录`);
}

// 重置
function handleReset() {
  filterFormApi.resetForm();
  filteredData.value = [...allData.value];
  gridApi.setGridOptions({ data: filteredData.value });
  ElMessage.success('已重置筛选条件');
}

// 查看详情
function handleDetail(row: UserRecord) {
  currentUser.value = row;
  detailDrawerApi.setData({ user: row });
  detailDrawerApi.open();
}

// 冻结用户
async function handleFreeze(row: UserRecord) {
  try {
    await ElMessageBox.confirm(
      `确定要冻结用户 ${row.nickname}(${row.uid}) 的登录权限吗？`,
      '确认冻结',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );
    row.frozen = true;
    ElMessage.success(`用户 ${row.nickname} 已冻结`);
  } catch {
    // 用户取消
  }
}

// 解冻用户
async function handleUnfreeze(row: UserRecord) {
  try {
    await ElMessageBox.confirm(
      `确定要解冻用户 ${row.nickname}(${row.uid}) 的登录权限吗？`,
      '确认解冻',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      },
    );
    row.frozen = false;
    ElMessage.success(`用户 ${row.nickname} 已解冻`);
  } catch {
    // 用户取消
  }
}

// 打开导出对话框
function openExportDialog() {
  exportDialogVisible.value = true;
  exportDateRange.value = null;
}

// 导出Excel
function handleExport() {
  if (!exportDateRange.value || exportDateRange.value.length !== 2) {
    ElMessage.warning('请选择导出日期范围');
    return;
  }

  const startTime = new Date(exportDateRange.value[0]).getTime();
  const endTime = new Date(exportDateRange.value[1]).getTime();

  const exportData = allData.value.filter((item) => {
    const registerTime = new Date(item.registerTime).getTime();
    return registerTime >= startTime && registerTime <= endTime;
  });

  // 生成CSV内容
  const headers = ['UID', '昵称', '用户名', '最近登录时间', '最近登录IP', '当月登录次数', '注册时间', '状态'];
  const rows = exportData.map((item) => [
    item.uid,
    item.nickname,
    item.username,
    item.lastLoginTime,
    item.lastLoginIp,
    item.monthlyLoginCount,
    item.registerTime,
    item.frozen ? '已冻结' : '正常',
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  // 创建下载链接
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `用户列表_${exportDateRange.value[0]}_${exportDateRange.value[1]}.csv`;
  link.click();

  exportDialogVisible.value = false;
  ElMessage.success(`成功导出 ${exportData.length} 条用户数据`);
}
</script>

<template>
  <Page :title="$t('page.userList.title')">
    <ElCard class="mb-4">
      <FilterForm />
    </ElCard>

    <ElCard>
      <Grid>
        <template #action="{ row }">
          <div class="flex items-center gap-2">
            <ElButton link type="primary" @click="handleDetail(row)">
              {{ $t('common.detail') }}
            </ElButton>
            <ElButton
              :disabled="row.frozen"
              link
              type="danger"
              @click="handleFreeze(row)"
            >
              {{ $t('common.freeze') }}
            </ElButton>
            <ElButton
              :disabled="!row.frozen"
              link
              type="success"
              @click="handleUnfreeze(row)"
            >
              {{ $t('common.unfreeze') }}
            </ElButton>
          </div>
        </template>
      </Grid>
    </ElCard>

    <!-- 导出对话框 -->
    <ElDialog
      v-model="exportDialogVisible"
      :title="$t('common.export')"
      width="500px"
    >
      <div class="py-4">
        <div class="mb-4 text-gray-600">
          {{ $t('page.userList.exportTip') }}
        </div>
        <ElDatePicker
          v-model="exportDateRange"
          type="datetimerange"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          class="w-full"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="exportDialogVisible = false">
            {{ $t('common.cancel') }}
          </ElButton>
          <ElButton type="primary" @click="handleExport">
            {{ $t('common.confirm') }}
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 详情抽屉 -->
    <DetailDrawer />
  </Page>
</template>
