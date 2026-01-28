<template>
  <div class="p-4">
    <Card>
      <template #title>
        <span>{{ $t('page.userList.title') }}</span>
      </template>
      
      <!-- 搜索表单 -->
      <Form
        ref="searchFormRef"
        :model="searchForm"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        class="mb-4"
      >
        <Row :gutter="16">
          <Col :span="6">
            <FormItem :label="$t('page.userList.uid')" name="uid">
              <Input v-model:value="searchForm.uid" :placeholder="$t('page.userList.placeholder.uid')" />
            </FormItem>
          </Col>
          <Col :span="6">
            <FormItem :label="$t('page.userList.nickname')" name="nickname">
              <Input v-model:value="searchForm.nickname" :placeholder="$t('page.userList.placeholder.nickname')" />
            </FormItem>
          </Col>
          <Col :span="6">
            <FormItem :label="$t('page.userList.username')" name="username">
              <Input v-model:value="searchForm.username" :placeholder="$t('page.userList.placeholder.username')" />
            </FormItem>
          </Col>
          <Col :span="6">
            <FormItem :label="$t('page.userList.lastLoginIp')" name="lastLoginIp">
              <Input v-model:value="searchForm.lastLoginIp" :placeholder="$t('page.userList.placeholder.lastLoginIp')" />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col :span="6">
            <FormItem :label="$t('page.userList.lastLoginTime')" name="lastLoginTimeRange">
              <DatePicker.RangePicker
                v-model:value="lastLoginTimeRange"
                :placeholder="[$t('page.userList.placeholder.startTime'), $t('page.userList.placeholder.endTime')]"
                class="w-full"
              />
            </FormItem>
          </Col>
          <Col :span="6">
            <FormItem :label="$t('page.userList.monthlyLoginCount')" name="monthlyLoginCountRange">
              <Input.Group compact>
                <InputNumber
                  v-model:value="searchForm.monthlyLoginCountMin"
                  :placeholder="$t('page.userList.placeholder.min')"
                  class="w-1/2"
                />
                <InputNumber
                  v-model:value="searchForm.monthlyLoginCountMax"
                  :placeholder="$t('page.userList.placeholder.max')"
                  class="w-1/2"
                />
              </Input.Group>
            </FormItem>
          </Col>
          <Col :span="6">
            <FormItem :label="$t('page.userList.registerTime')" name="registerTimeRange">
              <DatePicker.RangePicker
                v-model:value="registerTimeRange"
                :placeholder="[$t('page.userList.placeholder.startTime'), $t('page.userList.placeholder.endTime')]"
                class="w-full"
              />
            </FormItem>
          </Col>
          <Col :span="6">
            <FormItem :wrapper-col="{ offset: 0, span: 18 }">
              <Space>
                <Button type="primary" @click="handleSearch">
                  <template #icon><Search /></template>
                  {{ $t('common.search') }}
                </Button>
                <Button @click="handleReset">
                  <template #icon><RotateCw /></template>
                  {{ $t('common.reset') }}
                </Button>
              </Space>
            </FormItem>
          </Col>
        </Row>
      </Form>

      <!-- 用户列表表格 -->
      <Table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="paginationConfig"
        row-key="uid"
        class="mt-4"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Space>
              <Button type="link" size="small" @click="handleDetail(record)">
                {{ $t('common.detail') }}
              </Button>
              <Button
                type="link"
                size="small"
                :disabled="record.status === 'frozen'"
                @click="handleFreeze(record)"
              >
                {{ $t('page.userList.freeze') }}
              </Button>
              <Button
                type="link"
                size="small"
                :disabled="record.status === 'active'"
                @click="handleUnfreeze(record)"
              >
                {{ $t('page.userList.unfreeze') }}
              </Button>
            </Space>
          </template>
          <template v-else-if="column.key === 'status'">
            <Tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status === 'active' ? $t('page.userList.active') : $t('page.userList.frozen') }}
            </Tag>
          </template>
        </template>
      </Table>
    </Card>

    <!-- 用户详情抽屉 -->
    <UserDetailDrawer
      v-model:visible="detailVisible"
      :user-data="currentUser"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { $t } from '@vben/locales';
import { message } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';

import {
  Card,
  Col,
  DatePicker,
  Form,
  FormItem,
  Input,
  InputNumber,
  Row,
  Space,
  Button,
  Table,
  Tag,
} from 'ant-design-vue';
import { Search, RotateCw } from '@vben/icons';

import { getUserListApi, freezeUserApi, unfreezeUserApi } from '#/api';
import type { UserListItem, UserListParams } from '#/types/user';
import UserDetailDrawer from './user-detail-drawer.vue';

// const { t } = useI18n();

// 搜索表单
const searchFormRef = ref();
const searchForm = reactive({
  uid: '',
  nickname: '',
  username: '',
  lastLoginIp: '',
  monthlyLoginCountMin: undefined as number | undefined,
  monthlyLoginCountMax: undefined as number | undefined,
  lastLoginTimeStart: '',
  lastLoginTimeEnd: '',
  registerTimeStart: '',
  registerTimeEnd: '',
});

const lastLoginTimeRange = ref<[Dayjs, Dayjs] | null>(null);
const registerTimeRange = ref<[Dayjs, Dayjs] | null>(null);

// 表格数据
const dataSource = ref<UserListItem[]>([]);
const loading = ref(false);
const detailVisible = ref(false);
const currentUser = ref<UserListItem | null>(null);

// 分页配置
const paginationConfig = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => $t('common.total', { total }),
});

// 表格列配置
const columns = computed(() => [
  {
    title: $t('page.userList.uid'),
    dataIndex: 'uid',
    key: 'uid',
    width: 120,
  },
  {
    title: $t('page.userList.nickname'),
    dataIndex: 'nickname',
    key: 'nickname',
    width: 120,
  },
  {
    title: $t('page.userList.username'),
    dataIndex: 'username',
    key: 'username',
    width: 120,
  },
  {
    title: $t('page.userList.lastLoginTime'),
    dataIndex: 'lastLoginTime',
    key: 'lastLoginTime',
    width: 180,
  },
  {
    title: $t('page.userList.lastLoginIp'),
    dataIndex: 'lastLoginIp',
    key: 'lastLoginIp',
    width: 120,
  },
  {
    title: $t('page.userList.monthlyLoginCount'),
    dataIndex: 'monthlyLoginCount',
    key: 'monthlyLoginCount',
    width: 120,
    align: 'center',
  },
  {
    title: $t('page.userList.registerTime'),
    dataIndex: 'registerTime',
    key: 'registerTime',
    width: 180,
  },
  {
    title: $t('page.userList.status'),
    dataIndex: 'status',
    key: 'status',
    width: 80,
    align: 'center',
  },
  {
    title: $t('common.action'),
    key: 'action',
    width: 200,
    align: 'center',
    fixed: 'right',
  },
]);

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true;
  try {
    const params: UserListParams = {
      ...searchForm,
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    };

    // 处理时间范围
    if (lastLoginTimeRange.value) {
      params.lastLoginTimeStart = lastLoginTimeRange.value[0].format('YYYY-MM-DD');
      params.lastLoginTimeEnd = lastLoginTimeRange.value[1].format('YYYY-MM-DD');
    }
    if (registerTimeRange.value) {
      params.registerTimeStart = registerTimeRange.value[0].format('YYYY-MM-DD');
      params.registerTimeEnd = registerTimeRange.value[1].format('YYYY-MM-DD');
    }

    const response = await getUserListApi(params);
    dataSource.value = response.list;
    paginationConfig.total = response.total;
  } catch (error) {
    message.error($t('common.fetchError'));
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  paginationConfig.current = 1;
  fetchUserList();
};

// 重置
const handleReset = () => {
  searchFormRef.value.resetFields();
  lastLoginTimeRange.value = null;
  registerTimeRange.value = null;
  handleSearch();
};

// 查看详情
const handleDetail = (record: UserListItem) => {
  currentUser.value = record;
  detailVisible.value = true;
};

// 冻结用户
const handleFreeze = async (record: UserListItem) => {
  try {
    await freezeUserApi(record.uid);
    message.success($t('page.userList.freezeSuccess'));
    record.status = 'frozen';
  } catch (error) {
    message.error($t('page.userList.freezeError'));
  }
};

// 解冻用户
const handleUnfreeze = async (record: UserListItem) => {
  try {
    await unfreezeUserApi(record.uid);
    message.success($t('page.userList.unfreezeSuccess'));
    record.status = 'active';
  } catch (error) {
    message.error($t('page.userList.unfreezeError'));
  }
};

// 分页变化
const handleTableChange = (pagination: any) => {
  paginationConfig.current = pagination.current;
  paginationConfig.pageSize = pagination.pageSize;
  fetchUserList();
};

onMounted(() => {
  fetchUserList();
});
</script>
