<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

interface UserInfo {
  uid: string;
  nickname: string;
  username: string;
  avatar: string;
  lastLoginTime: string;
  lastLoginIp: string;
  loginCountThisMonth: number;
  registerTime: string;
  status: 'normal' | 'frozen';
  email: string;
  phone: string;
}

const allUsers = ref<UserInfo[]>([]);

const generateMockData = () => {
  const users: UserInfo[] = [];
  const statuses: ('normal' | 'frozen')[] = ['normal', 'frozen'];
  
  let uid = 10000;
  
  const generateUsersForYear = (year: number) => {
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const usersPerDay = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < usersPerDay; i++) {
          const registerTime = dayjs(new Date(year, month, day, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)));
          const lastLoginTime = registerTime.add(Math.floor(Math.random() * 90), 'day');
          
          users.push({
            uid: String(uid++),
            nickname: `用户${uid}`,
            username: `user${uid}`,
            avatar: '',
            lastLoginTime: lastLoginTime.format('YYYY-MM-DD HH:mm:ss'),
            lastLoginIp: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
            loginCountThisMonth: Math.floor(Math.random() * 100),
            registerTime: registerTime.format('YYYY-MM-DD HH:mm:ss'),
            status: statuses[Math.floor(Math.random() * statuses.length)] as 'normal' | 'frozen',
            email: `user${uid}@example.com`,
            phone: `1${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
          });
        }
      }
    }
  };
  
  generateUsersForYear(2024);
  generateUsersForYear(2025);
  
  return users;
};

allUsers.value = generateMockData();

const searchParams = ref({
  uid: '',
  nickname: '',
  username: '',
  lastLoginTimeStart: '',
  lastLoginTimeEnd: '',
  lastLoginIp: '',
  loginCountMin: undefined as number | undefined,
  loginCountMax: undefined as number | undefined,
  registerTimeStart: '',
  registerTimeEnd: '',
});

const [DetailDrawer, detailDrawerApi] = useVbenDrawer();
const currentUser = ref<UserInfo | null>(null);

const [ExportModal, exportModalApi] = useVbenModal();
const [ExportForm, exportFormApi] = useVbenForm({
  showDefaultActions: false,
  schema: [
    {
      fieldName: 'startDate',
      label: '开始日期',
      component: 'DatePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
      },
      rules: 'required',
    },
    {
      fieldName: 'endDate',
      label: '结束日期',
      component: 'DatePicker',
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
      },
      rules: 'required',
    },
  ],
});

const filteredUsers = computed(() => {
  let result = [...allUsers.value];
  
  const params = searchParams.value;
  
  if (params.uid) {
    result = result.filter(u => u.uid.includes(params.uid));
  }
  if (params.nickname) {
    result = result.filter(u => u.nickname.includes(params.nickname));
  }
  if (params.username) {
    result = result.filter(u => u.username.includes(params.username));
  }
  if (params.lastLoginIp) {
    result = result.filter(u => u.lastLoginIp.includes(params.lastLoginIp));
  }
  if (params.lastLoginTimeStart) {
    result = result.filter(u => dayjs(u.lastLoginTime).isAfter(dayjs(params.lastLoginTimeStart).startOf('day')));
  }
  if (params.lastLoginTimeEnd) {
    result = result.filter(u => dayjs(u.lastLoginTime).isBefore(dayjs(params.lastLoginTimeEnd).endOf('day')));
  }
  if (params.loginCountMin !== undefined) {
    result = result.filter(u => u.loginCountThisMonth >= params.loginCountMin!);
  }
  if (params.loginCountMax !== undefined) {
    result = result.filter(u => u.loginCountThisMonth <= params.loginCountMax!);
  }
  if (params.registerTimeStart) {
    result = result.filter(u => dayjs(u.registerTime).isAfter(dayjs(params.registerTimeStart).startOf('day')));
  }
  if (params.registerTimeEnd) {
    result = result.filter(u => dayjs(u.registerTime).isBefore(dayjs(params.registerTimeEnd).endOf('day')));
  }
  
  return result;
});

const formOptions: VbenFormProps = {
  collapsed: false,
  showCollapseButton: true,
  submitButtonOptions: {
    content: '查询',
  },
  resetButtonOptions: {
    content: '重置',
  },
  submitOnChange: false,
  submitOnEnter: false,
  handleSubmit: (values: Record<string, any>) => {
    searchParams.value = { ...searchParams.value, ...values };
    gridApi.reload();
  },
  handleReset: () => {
    searchParams.value = {
      uid: '',
      nickname: '',
      username: '',
      lastLoginTimeStart: '',
      lastLoginTimeEnd: '',
      lastLoginIp: '',
      loginCountMin: undefined,
      loginCountMax: undefined,
      registerTimeStart: '',
      registerTimeEnd: '',
    };
    gridApi.reload();
  },
  schema: [
    {
      fieldName: 'uid',
      label: '用户UID',
      component: 'Input',
      componentProps: {
        placeholder: '请输入UID',
      },
    },
    {
      fieldName: 'nickname',
      label: '昵称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入昵称',
      },
    },
    {
      fieldName: 'username',
      label: '用户名',
      component: 'Input',
      componentProps: {
        placeholder: '请输入用户名',
      },
    },
    {
      fieldName: 'lastLoginTime',
      label: '最近登录时间',
      component: 'DatePicker',
      componentProps: {
        type: 'daterange',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        valueFormat: 'YYYY-MM-DD',
        rangeSeparator: '-',
        onChange: (val: [string, string] | null) => {
          if (val) {
            searchParams.value.lastLoginTimeStart = val[0];
            searchParams.value.lastLoginTimeEnd = val[1];
          } else {
            searchParams.value.lastLoginTimeStart = '';
            searchParams.value.lastLoginTimeEnd = '';
          }
        },
      },
    },
    {
      fieldName: 'lastLoginIp',
      label: '最近登录IP',
      component: 'Input',
      componentProps: {
        placeholder: '请输入IP',
      },
    },
    {
      fieldName: 'loginCount',
      label: '当月登录次数',
      component: 'Input',
      componentProps: {
        type: 'number',
        placeholder: '最小-最大',
        controlsPosition: 'right',
        onChange: (val: string) => {
          const parts = val.split('-');
          if (parts.length === 2) {
            searchParams.value.loginCountMin = Number(parts[0]) || undefined;
            searchParams.value.loginCountMax = Number(parts[1]) || undefined;
          } else {
            searchParams.value.loginCountMin = undefined;
            searchParams.value.loginCountMax = undefined;
          }
        },
      },
    },
    {
      fieldName: 'registerTime',
      label: '注册时间',
      component: 'DatePicker',
      componentProps: {
        type: 'daterange',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        valueFormat: 'YYYY-MM-DD',
        rangeSeparator: '-',
        onChange: (val: [string, string] | null) => {
          if (val) {
            searchParams.value.registerTimeStart = val[0];
            searchParams.value.registerTimeEnd = val[1];
          } else {
            searchParams.value.registerTimeStart = '';
            searchParams.value.registerTimeEnd = '';
          }
        },
      },
    },
  ],
};

const gridOptions: VxeGridProps<UserInfo> = {
  columns: [
    { title: '序号', type: 'seq', width: 60 },
    { field: 'uid', title: '用户UID', width: 100 },
    { field: 'nickname', title: '昵称', minWidth: 120 },
    { field: 'username', title: '用户名', minWidth: 120 },
    { field: 'lastLoginTime', title: '最近登录时间', width: 180, formatter: 'formatDateTime' },
    { field: 'lastLoginIp', title: '最近登录IP', width: 140 },
    { field: 'loginCountThisMonth', title: '当月登录次数', width: 120 },
    { field: 'registerTime', title: '注册时间', width: 180, formatter: 'formatDateTime' },
    {
      title: '操作',
      width: 280,
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  keepSource: true,
  pagerConfig: {
    pageSize: 20,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        const start = (page.currentPage - 1) * page.pageSize;
        const end = start + page.pageSize;
        const items = filteredUsers.value.slice(start, end);
        return {
          items,
          total: filteredUsers.value.length,
        };
      },
    },
  },
  toolbarConfig: {
    custom: true,
    slots: {
      buttons: 'toolbar_buttons',
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

const handleViewDetail = async (row: UserInfo) => {
  currentUser.value = row;
  detailDrawerApi.open();
};

const handleFreeze = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要冻结用户"${row.nickname}"的登录权限吗？冻结后该用户将无法登录系统`,
      '确认冻结',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );
    
    const user = allUsers.value.find(u => u.uid === row.uid);
    if (user) {
      user.status = 'frozen';
    }
    ElMessage.success('已冻结用户登录权限');
    gridApi.reload();
  } catch {
    // 取消操作
  }
};

const handleUnfreeze = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要解冻用户"${row.nickname}"的登录权限吗？解冻后该用户可以正常登录系统`,
      '确认解冻',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );
    
    const user = allUsers.value.find(u => u.uid === row.uid);
    if (user) {
      user.status = 'normal';
    }
    ElMessage.success('已解冻用户登录权限');
    gridApi.reload();
  } catch {
    // 取消操作
  }
};

const handleExport = () => {
  exportModalApi.open();
};

const doExport = async () => {
  const validateResult = await exportFormApi.validate();
  if (!validateResult?.valid) {
    return;
  }
  const values = await exportFormApi.getValues();
  
  const startDate = values.startDate as string;
  const endDate = values.endDate as string;
  
  const exportData = allUsers.value.filter(u => {
    const registerDay = dayjs(u.registerTime);
    return registerDay.isAfter(dayjs(startDate).subtract(1, 'day')) && 
           registerDay.isBefore(dayjs(endDate).add(1, 'day'));
  });
  
  const data = [
    ['UID', '昵称', '用户名', '最近登录时间', '最近登录IP', '当月登录次数', '注册时间', '状态'],
    ...exportData.map(u => [
      u.uid,
      u.nickname,
      u.username,
      u.lastLoginTime,
      u.lastLoginIp,
      u.loginCountThisMonth,
      u.registerTime,
      u.status === 'normal' ? '正常' : '冻结',
    ]),
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '用户列表');
  XLSX.writeFile(wb, `用户列表_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`);
  
  exportModalApi.close();
  ElMessage.success(`已导出${exportData.length}条数据`);
};
</script>

<template>
  <Page class="p-4">
    <Grid>
      <template #toolbar_buttons>
        <VbenButton type="primary" @click="handleExport">
          导出Excel
        </VbenButton>
      </template>
      <template #action="{ row }: { row: UserInfo }">
        <div class="flex items-center justify-center gap-2">
          <VbenButton size="sm" type="primary" @click="() => handleViewDetail(row)">
            详情
          </VbenButton>
          <VbenButton
            v-if="row.status === 'normal'"
            size="sm"
            type="danger"
            @click="() => handleFreeze(row)"
          >
            冻结登录
          </VbenButton>
          <VbenButton
            v-else
            size="sm"
            type="success"
            @click="() => handleUnfreeze(row)"
          >
            解冻登录
          </VbenButton>
        </div>
      </template>
    </Grid>
    
    <DetailDrawer title="用户详情" class="w-[500px]">
      <div v-if="currentUser" class="space-y-4">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户UID">{{ currentUser.uid }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ currentUser.nickname }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
          <el-descriptions-item label="最近登录时间">{{ currentUser.lastLoginTime }}</el-descriptions-item>
          <el-descriptions-item label="最近登录IP">{{ currentUser.lastLoginIp }}</el-descriptions-item>
          <el-descriptions-item label="当月登录次数">{{ currentUser.loginCountThisMonth }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ currentUser.registerTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentUser.status === 'normal' ? 'success' : 'danger'">
              {{ currentUser.status === 'normal' ? '正常' : '已冻结' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </DetailDrawer>
    
    <ExportModal title="导出Excel" class="w-[450px]" @confirm="doExport">
      <ExportForm />
    </ExportModal>
  </Page>
</template>
