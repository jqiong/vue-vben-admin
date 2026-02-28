<script lang="ts" setup>
import { Camera } from '@vben/icons';
import { $t } from '@vben/locales';

import { ElButton, ElTooltip } from 'element-plus';

import ScreenshotModal from './screenshot-modal.vue';
import { ref } from 'vue';

defineOptions({
  name: 'ScreenshotButton',
});

const modalVisible = ref(false);

function handleClick() {
  modalVisible.value = true;
}

function handleClose() {
  modalVisible.value = false;
}
</script>

<template>
  <div>
    <ElTooltip :content="$t('ui.widgets.screenshot')" placement="bottom">
      <ElButton class="mr-1" size="small" text @click="handleClick">
        <Camera class="size-4" />
      </ElButton>
    </ElTooltip>
    <ScreenshotModal v-model="modalVisible" @close="handleClose" />
  </div>
</template>
