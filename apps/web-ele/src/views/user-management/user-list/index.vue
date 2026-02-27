<script lang="ts" setup>
import { computed, h, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElDialog,
  ElDrawer,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElSpace,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

interface UserInfo {
  uid: string;
  nickname: string;
  username: string;
  lastLoginTime: string;
  lastLoginIp: string;
  monthlyLoginCount: number;
  registerTime: string;
  status: 'active' | 'frozen';
}

const generateMockData = (): UserInfo[] => {
  const data: UserInfo[] = [];
  const names = [
    '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十',
    '郑十一', '王十二', '冯十三', '陈十四', '褚十五', '卫十六',
    '蒋十七', '沈十八', '韩十九', '杨二十', '朱二一', '秦二二',
    '尤二三', '许二四', '何二五', '吕二六', '施二七', '张二八',
  ];
  const surnames = ['user', 'admin', 'test', 'demo', 'guest', 'member'];
  
  const generateDate = (year: number, monthStart: number, monthEnd: number): string => {
    const month = Math.floor(Math.random() * (monthEnd - monthStart + 1)) + monthStart;
    const day = Math.floor(Math.random() * 28) + 1;
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
  };

  const generateIp = (): string => {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  };

  let index = 1;
  
  for (let year = 2024; year <= 2025; year++) {
    for (let i = 0; i < 300; i++) {
      const nameIndex = (index - 1) % names.length;
      const surnameIndex = Math.floor(Math.random() * surnames.length);
      data.push({
        uid: `UID${String(index).padStart(6, '0')}`,
        nickname: names[nameIndex] + String(Math.floor(Math.random() * 100)),
        username: `${surnames[surnameIndex]}_${String(index).padStart(4, '0')}`,
        lastLoginTime: generateDate(year, 1, 12),
        lastLoginIp: generateIp(),
        monthlyLoginCount: Math.floor(Math.random() * 100) + 1,
        registerTime: generateDate(year, 1, 12),
        status: Math.random() > 0.1 ? 'active' : 'frozen',
      });
      index++;
    }
  }

  return data;
};

const allUsers = ref<UserInfo[]>(generateMockData());

const filterForm = ref({
  uid: '',
  nickname: '',
  username: '',
  lastLoginTimeRange: null as [string, string] | null,
  lastLoginIp: '',
  monthlyLoginCountMin: null as number | null,
  monthlyLoginCountMax: null as number | null,
  registerTimeRange: null as [string, string] | null,
});

const filteredUsers = computed(() => {
  let result = [...allUsers.value];

  if (filterForm.value.uid) {
    result = result.filter(user => 
      user.uid.toLowerCase().includes(filterForm.value.uid.toLowerCase())
    );
  }

  if (filterForm.value.nickname) {
    result = result.filter(user => 
      user.nickname.toLowerCase().includes(filterForm.value.nickname.toLowerCase())
    );
  }

  if (filterForm.value.username) {
    result = result.filter(user => 
      user.username.toLowerCase().includes(filterForm.value.username.toLowerCase())
    );
  }

  if (filterForm.value.lastLoginTimeRange && filterForm.value.lastLoginTimeRange.length === 2) {
    const [start, end] = filterForm.value.lastLoginTimeRange;
    result = result.filter(user => {
      const loginTime = new Date(user.lastLoginTime).getTime();
      return loginTime >= new Date(start).getTime() && loginTime <= new Date(end).getTime();
    });
  }

  if (filterForm.value.lastLoginIp) {
    result = result.filter(user => 
      user.lastLoginIp.includes(filterForm.value.lastLoginIp)
    );
  }

  if (filterForm.value.monthlyLoginCountMin !== null) {
    result = result.filter(user => user.monthlyLoginCount >= filterForm.value.monthlyLoginCountMin!);
  }

  if (filterForm.value.monthlyLoginCountMax !== null) {
    result = result.filter(user => user.monthlyLoginCount <= filterForm.value.monthlyLoginCountMax!);
  }

  if (filterForm.value.registerTimeRange && filterForm.value.registerTimeRange.length === 2) {
    const [start, end] = filterForm.value.registerTimeRange;
    result = result.filter(user => {
      const registerTime = new Date(user.registerTime).getTime();
      return registerTime >= new Date(start).getTime() && registerTime <= new Date(end).getTime();
    });
  }

  return result;
});

const handleSearch = () => {
  ElMessage.success(`查询完成，共找到 ${filteredUsers.value.length} 条记录`);
};

const handleReset = () => {
  filterForm.value = {
    uid: '',
    nickname: '',
    username: '',
    lastLoginTimeRange: null,
    lastLoginIp: '',
    monthlyLoginCountMin: null,
    monthlyLoginCountMax: null,
    registerTimeRange: null,
  };
  ElMessage.info('筛选条件已重置');
};

const currentUser = ref<UserInfo | null>(null);
const drawerVisible = ref(false);

const handleViewDetail = (row: UserInfo) => {
  currentUser.value = { ...row };
  drawerVisible.value = true;
};

const handleFreeze = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要冻结用户 "${row.nickname}" 吗？冻结后该用户将无法登录系统。`,
      '冻结确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    const user = allUsers.value.find(u => u.uid === row.uid);
    if (user) {
      user.status = 'frozen';
    }
    if (currentUser.value && currentUser.value.uid === row.uid) {
      currentUser.value.status = 'frozen';
    }
    ElMessage.success(`用户 "${row.nickname}" 已冻结`);
  } catch {
    ElMessage.info('已取消冻结操作');
  }
};

const handleUnfreeze = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要解冻用户 "${row.nickname}" 吗？解冻后该用户将恢复正常登录。`,
      '解冻确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    );
    
    const user = allUsers.value.find(u => u.uid === row.uid);
    if (user) {
      user.status = 'active';
    }
    if (currentUser.value && currentUser.value.uid === row.uid) {
      currentUser.value.status = 'active';
    }
    ElMessage.success(`用户 "${row.nickname}" 已解冻`);
  } catch {
    ElMessage.info('已取消解冻操作');
  }
};

const exportDialogVisible = ref(false);
const exportDateRange = ref<[string, string] | null>(null);

const handleExport = () => {
  exportDialogVisible.value = true;
  exportDateRange.value = null;
};

const confirmExport = () => {
  if (!exportDateRange.value || exportDateRange.value.length !== 2) {
    ElMessage.warning('请选择导出的日期范围');
    return;
  }

  const [startDate, endDate] = exportDateRange.value;
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  const exportData = allUsers.value.filter(user => {
    const registerTime = new Date(user.registerTime);
    return registerTime >= start && registerTime <= end;
  });

  if (exportData.length === 0) {
    ElMessage.warning('所选日期范围内没有数据');
    return;
  }

  const headers = ['用户UID', '昵称', '用户名', '最近登录时间', '最近登录IP', '当月登录次数', '注册时间', '状态'];
  const csvContent = [
    headers.join(','),
    ...exportData.map(user => [
      user.uid,
      user.nickname,
      user.username,
      user.lastLoginTime,
      user.lastLoginIp,
      user.monthlyLoginCount,
      user.registerTime,
      user.status === 'active' ? '正常' : '冻结'
    ].join(','))
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `用户列表_${startDate}_${endDate}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  exportDialogVisible.value = false;
  ElMessage.success(`成功导出 ${exportData.length} 条记录`);
};

const currentPage = ref(1);
const pageSize = ref(20);

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredUsers.value.slice(start, end);
});

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
};
</script>

<template>
  <Page description="管理系统中的用户信息，支持查看、冻结、解冻等操作" title="用户列表">
    <ElCard class="mb-4">
      <template #header>
        <div class="flex items-center justify-between">
          <span>筛选条件</span>
          <ElButton type="primary" @click="handleExport">
            导出Excel
          </ElButton>
        </div>
      </template>
      <ElForm :model="filterForm" label-width="120px" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ElFormItem label="用户UID">
          <ElInput v-model="filterForm.uid" placeholder="请输入用户UID" clearable />
        </ElFormItem>
        <ElFormItem label="昵称">
          <ElInput v-model="filterForm.nickname" placeholder="请输入昵称" clearable />
        </ElFormItem>
        <ElFormItem label="用户名">
          <ElInput v-model="filterForm.username" placeholder="请输入用户名" clearable />
        </ElFormItem>
        <ElFormItem label="最近登录IP">
          <ElInput v-model="filterForm.lastLoginIp" placeholder="请输入IP地址" clearable />
        </ElFormItem>
        <ElFormItem label="最近登录时间">
          <ElDatePicker
            v-model="filterForm.lastLoginTimeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem label="登录次数范围">
          <div class="flex items-center gap-2">
            <ElInputNumber
              v-model="filterForm.monthlyLoginCountMin"
              :min="0"
              placeholder="最小值"
              controls-position="right"
              class="flex-1"
            />
            <span>-</span>
            <ElInputNumber
              v-model="filterForm.monthlyLoginCountMax"
              :min="0"
              placeholder="最大值"
              controls-position="right"
              class="flex-1"
            />
          </div>
        </ElFormItem>
        <ElFormItem label="注册时间">
          <ElDatePicker
            v-model="filterForm.registerTimeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem label=" ">
          <ElSpace>
            <ElButton type="primary" @click="handleSearch">查询</ElButton>
            <ElButton @click="handleReset">重置</ElButton>
          </ElSpace>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span>用户列表</span>
          <span class="text-gray-500">共 {{ filteredUsers.length }} 条记录</span>
        </div>
      </template>
      <ElTable :data="paginatedUsers" stripe border style="width: 100%">
        <ElTableColumn prop="uid" label="用户UID" min-width="120" />
        <ElTableColumn prop="nickname" label="昵称" min-width="100" />
        <ElTableColumn prop="username" label="用户名" min-width="120" />
        <ElTableColumn prop="lastLoginTime" label="最近登录时间" min-width="160" />
        <ElTableColumn prop="lastLoginIp" label="最近登录IP" min-width="130" />
        <ElTableColumn prop="monthlyLoginCount" label="当月登录次数" min-width="110" align="center" />
        <ElTableColumn prop="registerTime" label="注册时间" min-width="160" />
        <ElTableColumn label="状态" min-width="80" align="center">
          <template #default="{ row }">
            <ElTag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '冻结' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" min-width="180">
          <template #default="{ row }">
            <ElSpace>
              <ElButton size="small" type="primary" link @click="handleViewDetail(row)">
                详情
              </ElButton>
              <ElButton
                size="small"
                type="warning"
                link
                :disabled="row.status === 'frozen'"
                @click="handleFreeze(row)"
              >
                冻结
              </ElButton>
              <ElButton
                size="small"
                type="success"
                link
                :disabled="row.status === 'active'"
                @click="handleUnfreeze(row)"
              >
                解冻
              </ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>
      <div class="mt-4 flex justify-end">
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredUsers.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </ElCard>

    <ElDrawer v-model="drawerVisible" title="用户详情" size="450px">
      <div v-if="currentUser" class="px-4">
        <ElForm label-width="120px">
          <ElFormItem label="用户UID">
            <span>{{ currentUser.uid }}</span>
          </ElFormItem>
          <ElFormItem label="昵称">
            <span>{{ currentUser.nickname }}</span>
          </ElFormItem>
          <ElFormItem label="用户名">
            <span>{{ currentUser.username }}</span>
          </ElFormItem>
          <ElFormItem label="最近登录时间">
            <span>{{ currentUser.lastLoginTime }}</span>
          </ElFormItem>
          <ElFormItem label="最近登录IP">
            <span>{{ currentUser.lastLoginIp }}</span>
          </ElFormItem>
          <ElFormItem label="当月登录次数">
            <span>{{ currentUser.monthlyLoginCount }}</span>
          </ElFormItem>
          <ElFormItem label="注册时间">
            <span>{{ currentUser.registerTime }}</span>
          </ElFormItem>
          <ElFormItem label="状态">
            <ElTag :type="currentUser.status === 'active' ? 'success' : 'danger'">
              {{ currentUser.status === 'active' ? '正常' : '冻结' }}
            </ElTag>
          </ElFormItem>
        </ElForm>
        <div class="mt-6 flex justify-center gap-4">
          <ElButton
            type="warning"
            :disabled="currentUser.status === 'frozen'"
            @click="handleFreeze(currentUser)"
          >
            冻结登录
          </ElButton>
          <ElButton
            type="success"
            :disabled="currentUser.status === 'active'"
            @click="handleUnfreeze(currentUser)"
          >
            解冻登录
          </ElButton>
        </div>
      </div>
    </ElDrawer>

    <ElDialog v-model="exportDialogVisible" title="导出用户数据" width="500px">
      <ElForm label-width="100px">
        <ElFormItem label="日期范围">
          <ElDatePicker
            v-model="exportDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElSpace>
          <ElButton @click="exportDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="confirmExport">确认导出</ElButton>
        </ElSpace>
      </template>
    </ElDialog>
  </Page>
</template>
