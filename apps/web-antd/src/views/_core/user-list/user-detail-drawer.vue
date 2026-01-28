<template>
  <Drawer
    v-model:open="visible"
    :title="$t('page.userList.userDetail')"
    placement="right"
    :width="400"
    :footer="null"
  >
    <div v-if="userData" class="space-y-4">
      <div class="border-b pb-4">
        <h3 class="text-lg font-medium mb-2">{{ $t('page.userList.basicInfo') }}</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">{{ $t('page.userList.uid') }}:</span>
            <span>{{ userData.uid }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">{{ $t('page.userList.nickname') }}:</span>
            <span>{{ userData.nickname }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">{{ $t('page.userList.username') }}:</span>
            <span>{{ userData.username }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">{{ $t('page.userList.status') }}:</span>
            <Tag :color="userData.status === 'active' ? 'green' : 'red'">
              {{ userData.status === 'active' ? $t('page.userList.active') : $t('page.userList.frozen') }}
            </Tag>
          </div>
        </div>
      </div>

      <div class="border-b pb-4">
        <h3 class="text-lg font-medium mb-2">{{ $t('page.userList.loginInfo') }}</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">{{ $t('page.userList.lastLoginTime') }}:</span>
            <span>{{ userData.lastLoginTime }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">{{ $t('page.userList.lastLoginIp') }}:</span>
            <span>{{ userData.lastLoginIp }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">{{ $t('page.userList.monthlyLoginCount') }}:</span>
            <span>{{ userData.monthlyLoginCount }}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-medium mb-2">{{ $t('page.userList.registerInfo') }}</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">{{ $t('page.userList.registerTime') }}:</span>
            <span>{{ userData.registerTime }}</span>
          </div>
        </div>
      </div>
    </div>
  </Drawer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Drawer, Tag } from 'ant-design-vue';
import type { UserListItem } from '#/types/user';

interface Props {
  visible: boolean;
  userData: UserListItem | null;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});
</script>