<script lang="ts" setup>
import { computed } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElDescriptions, ElDescriptionsItem, ElTag } from 'element-plus';

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

const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm() {
    drawerApi.close();
  },
});

const user = computed<UserRecord | null>(() => {
  const data = drawerApi.getData();
  return data?.user || null;
});
</script>

<template>
  <Drawer
    :cancel-text="$t('common.close')"
    :confirm-text="$t('common.confirm')"
    :title="$t('page.userList.userDetail')"
    class="w-[600px]"
  >
    <div v-if="user" class="p-4">
      <ElDescriptions :column="1" border>
        <ElDescriptionsItem :label="$t('page.userList.uid')">
          {{ user.uid }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.userList.nickname')">
          {{ user.nickname }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.userList.username')">
          {{ user.username }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.userList.lastLoginTime')">
          {{ user.lastLoginTime }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.userList.lastLoginIp')">
          {{ user.lastLoginIp }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.userList.monthlyLoginCount')">
          {{ user.monthlyLoginCount }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.userList.registerTime')">
          {{ user.registerTime }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.userList.status')">
          <ElTag v-if="user.frozen" type="danger">
            {{ $t('common.frozen') }}
          </ElTag>
          <ElTag v-else type="success">
            {{ $t('common.normal') }}
          </ElTag>
        </ElDescriptionsItem>
      </ElDescriptions>
    </div>
  </Drawer>
</template>
