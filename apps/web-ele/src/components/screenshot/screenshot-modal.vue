<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElEmpty,
  ElImage,
  ElRadio,
  ElRadioGroup,
  ElSpace,
} from 'element-plus';

import { captureScreenshot, captureFullPageScreenshot } from './utils';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

defineOptions({
  name: 'ScreenshotModal',
});

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const screenshotType = ref<'current' | 'full'>('current');
const previewUrl = ref('');
const isCapturing = ref(false);
const captureTime = ref('');

const hasPreview = computed(() => !!previewUrl.value);

watch(visible, (isOpen) => {
  if (isOpen) {
    screenshotType.value = 'current';
    previewUrl.value = '';
    isCapturing.value = false;
    captureTime.value = '';
  }
});

function handleClose() {
  visible.value = false;
  emit('close');
}

async function handleCapture() {
  isCapturing.value = true;
  try {
    const contentElement = document.querySelector(
      '.vben-admin-layout__content',
    ) as HTMLElement;
    const targetElement = contentElement || document.body;

    let canvas: HTMLCanvasElement;
    if (screenshotType.value === 'current') {
      canvas = await captureScreenshot(targetElement);
    } else {
      canvas = await captureFullPageScreenshot(targetElement);
    }

    previewUrl.value = canvas.toDataURL('image/png');
    captureTime.value = new Date().toLocaleString();
  } finally {
    isCapturing.value = false;
  }
}

function handleDownload() {
  if (!previewUrl.value) return;

  const link = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const type = screenshotType.value === 'current' ? 'screenshot' : 'fullpage';
  link.download = `${type}-${timestamp}.png`;
  link.href = previewUrl.value;
  link.click();
}

function handleReset() {
  previewUrl.value = '';
  captureTime.value = '';
}
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="$t('ui.widgets.screenshotTitle')"
    width="800px"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <!-- 选项区域 -->
      <ElCard shadow="never">
        <ElRadioGroup v-model="screenshotType" class="flex gap-6">
          <ElSpace direction="vertical" :size="4" alignment="flex-start">
            <ElRadio value="current">
              <span class="font-medium">
                {{ $t('ui.widgets.screenshotCurrent') }}
              </span>
            </ElRadio>
            <span class="text-gray-400 ml-6 text-xs">
              {{ $t('ui.widgets.screenshotCurrentDesc') }}
            </span>
          </ElSpace>
          <ElSpace direction="vertical" :size="4" alignment="flex-start">
            <ElRadio value="full">
              <span class="font-medium">
                {{ $t('ui.widgets.screenshotFull') }}
              </span>
            </ElRadio>
            <span class="text-gray-400 ml-6 text-xs">
              {{ $t('ui.widgets.screenshotFullDesc') }}
            </span>
          </ElSpace>
        </ElRadioGroup>
      </ElCard>

      <!-- 预览区域 -->
      <ElCard v-if="hasPreview" shadow="never">
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-500 text-sm">
            {{ $t('ui.widgets.screenshotPreview') }}
          </span>
          <span v-if="captureTime" class="text-gray-400 text-xs">
            {{ captureTime }}
          </span>
        </div>
        <div class="bg-checkerboard max-h-[400px] overflow-auto rounded border">
          <ElImage
            :src="previewUrl"
            :preview-src-list="[previewUrl]"
            fit="contain"
            class="max-w-full"
          />
        </div>
      </ElCard>

      <!-- 空状态 -->
      <ElCard v-else shadow="never">
        <ElEmpty :description="$t('ui.widgets.screenshotEmpty')" />
      </ElCard>

      <!-- 操作按钮 -->
      <div class="flex justify-end gap-2">
        <ElButton v-if="hasPreview" @click="handleReset">
          {{ $t('common.reset') }}
        </ElButton>
        <ElButton :loading="isCapturing" @click="handleCapture">
          {{
            hasPreview
              ? $t('ui.widgets.screenshotRecapture')
              : $t('ui.widgets.screenshotCapture')
          }}
        </ElButton>
        <ElButton v-if="hasPreview" type="primary" @click="handleDownload">
          {{ $t('ui.widgets.screenshotDownload') }}
        </ElButton>
      </div>
    </div>
  </ElDialog>
</template>

<style scoped>
.bg-checkerboard {
  background-image:
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}
</style>
