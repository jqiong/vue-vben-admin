<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { Camera, Check, RotateCcw, X } from '@vben/icons';
import { ElMessage } from 'element-plus';

import { useVbenModal } from '@vben-core/popup-ui';

import type html2canvasType from 'html2canvas';

defineOptions({
  name: 'ScreenshotButton',
});

const screenshotType = ref<'visible' | 'full'>('visible');
const previewUrl = ref<string>('');
const isCapturing = ref(false);
const originalScrollPosition = ref({ top: 0, left: 0 });

const [Modal, modalApi] = useVbenModal({
  closable: true,
  closeOnClickModal: false,
  onCancel() {
    resetState();
  },
  onConfirm: async () => {
    await downloadImage();
    modalApi.close();
    resetState();
  },
  showCancelButton: true,
  showConfirmButton: true,
  title: '截屏功能',
});

function openModal() {
  modalApi.open();
}

function resetState() {
  previewUrl.value = '';
  screenshotType.value = 'visible';
  isCapturing.value = false;
}

async function getHtml2Canvas() {
  const { default: fn } = await import('html2canvas');
  return fn as typeof html2canvasType;
}

async function captureVisible() {
  isCapturing.value = true;
  try {
    const contentEl = document.querySelector('.scrollbar-container') || document.body;
    const html2canvas = await getHtml2Canvas();
    const canvas = await html2canvas(contentEl as HTMLElement, {
      backgroundColor: '#ffffff',
      logging: false,
      scale: window.devicePixelRatio || 2,
      useCORS: true,
    });
    previewUrl.value = canvas.toDataURL('image/png');
  } catch (error) {
    console.error('截图失败:', error);
    ElMessage.error('截图失败，请重试');
  } finally {
    isCapturing.value = false;
  }
}

async function captureFull() {
  isCapturing.value = true;
  const scrollContainer = document.querySelector('.scrollbar-container') as HTMLElement || document.documentElement;
  const scrollHeight = scrollContainer.scrollHeight;
  const clientHeight = scrollContainer.clientHeight;
  const scrollWidth = scrollContainer.scrollWidth;
  const clientWidth = scrollContainer.clientWidth;

  const hasVerticalScroll = scrollHeight > clientHeight;
  const hasHorizontalScroll = scrollWidth > clientWidth;

  if (!hasVerticalScroll && !hasHorizontalScroll) {
    await captureVisible();
    return;
  }

  originalScrollPosition.value = {
    left: scrollContainer.scrollLeft,
    top: scrollContainer.scrollTop,
  };

  try {
    if (hasVerticalScroll) {
      scrollContainer.scrollTop = 0;
    }
    if (hasHorizontalScroll) {
      scrollContainer.scrollLeft = 0;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    const totalHeight = scrollHeight;
    const viewportHeight = clientHeight;
    const numScreenshots = Math.ceil(totalHeight / viewportHeight);

    const canvas = document.createElement('canvas');
    canvas.width = scrollWidth * (window.devicePixelRatio || 2);
    canvas.height = totalHeight * (window.devicePixelRatio || 2);
    const ctx = canvas.getContext('2d')!;

    for (let i = 0; i < numScreenshots; i++) {
      const scrollToY = i * viewportHeight;
      scrollContainer.scrollTop = scrollToY;
      await new Promise((resolve) => setTimeout(resolve, 150));

      const html2canvas = await getHtml2Canvas();
      const partialCanvas = await html2canvas(scrollContainer, {
        backgroundColor: '#ffffff',
        height: viewportHeight,
        logging: false,
        scale: window.devicePixelRatio || 2,
        useCORS: true,
        windowHeight: viewportHeight,
      });

      const yOffset = i * viewportHeight * (window.devicePixelRatio || 2);
      ctx.drawImage(partialCanvas, 0, yOffset);
    }

    previewUrl.value = canvas.toDataURL('image/png');
  } catch (error) {
    console.error('长截图失败:', error);
    ElMessage.error('长截图失败，请重试');
  } finally {
    scrollContainer.scrollTop = originalScrollPosition.value.top;
    scrollContainer.scrollLeft = originalScrollPosition.value.left;
    isCapturing.value = false;
  }
}

async function startCapture() {
  if (screenshotType.value === 'visible') {
    await captureVisible();
  } else {
    await captureFull();
  }
}

async function downloadImage() {
  if (!previewUrl.value) {
    ElMessage.warning('请先进行截图');
    return;
  }

  const link = document.createElement('a');
  link.download = `screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
  link.href = previewUrl.value;
  link.click();
  ElMessage.success('图片已保存');
}

watch(() => screenshotType.value, () => {
  if (previewUrl.value) {
    previewUrl.value = '';
  }
});

onMounted(() => {
  const style = document.createElement('style');
  style.textContent = `
    .scrollbar-container {
      scroll-behavior: auto !important;
    }
  `;
  document.head.appendChild(style);
});
</script>

<template>
  <div>
    <Modal class="screenshot-modal">
      <template #title>
        <div class="flex items-center gap-2">
          <Camera class="size-5" />
          <span>截屏功能</span>
        </div>
      </template>

      <div class="min-h-[300px] w-[600px]">
        <div class="mb-4 flex gap-4">
          <label
            class="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 transition-all"
            :class="screenshotType === 'visible' ? 'border-primary bg-primary/5' : 'border-border'"
            @click="screenshotType = 'visible'"
          >
            <input v-model="screenshotType" type="radio" value="visible" class="hidden" />
            <Camera class="size-4" />
            <span>当前屏截图</span>
          </label>
          <label
            class="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 transition-all"
            :class="screenshotType === 'full' ? 'border-primary bg-primary/5' : 'border-border'"
            @click="screenshotType = 'full'"
          >
            <input v-model="screenshotType" type="radio" value="full" class="hidden" />
            <RotateCcw class="size-4" />
            <span>滚动截图</span>
          </label>
        </div>

        <div
          class="relative flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 overflow-hidden"
        >
          <template v-if="isCapturing">
            <div class="flex flex-col items-center gap-2">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span class="text-muted-foreground">正在截图中...</span>
            </div>
          </template>
          <template v-else-if="previewUrl">
            <img :src="previewUrl" alt="截图预览" class="max-h-[400px] object-contain" />
          </template>
          <template v-else>
            <div class="text-muted-foreground flex flex-col items-center gap-2">
              <Camera class="size-12 opacity-50" />
              <span>点击下方按钮开始截图</span>
            </div>
          </template>
        </div>

        <div class="mt-4 flex justify-center gap-4">
          <button
            class="hover:bg-primary/90 bg-primary text-primary-foreground inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition-colors"
            :disabled="isCapturing"
            @click="startCapture"
          >
            <Camera class="mr-2 size-4" />
            开始截图
          </button>
          <button
            v-if="previewUrl"
            class="hover:bg-muted border-border bg-background hover:border-muted-foreground/50 inline-flex items-center justify-center rounded-md border px-4 py-2 font-medium transition-colors"
            @click="previewUrl = ''"
          >
            <X class="mr-2 size-4" />
            重新截图
          </button>
        </div>
      </div>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <button
            class="border-border bg-background hover:bg-muted hover:border-muted-foreground/50 inline-flex items-center justify-center rounded-md border px-4 py-2 font-medium transition-colors"
            @click="modalApi.close(); resetState()"
          >
            <X class="mr-2 size-4" />
            取消
          </button>
          <button
            class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition-colors"
            :disabled="!previewUrl"
            :class="{ 'opacity-50 cursor-not-allowed': !previewUrl }"
            @click="downloadImage(); modalApi.close(); resetState()"
          >
            <Check class="mr-2 size-4" />
            确定保存
          </button>
        </div>
      </template>
    </Modal>

    <div
      class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:bg-black/5 hover:text-foreground md:h-8 md:w-8"
      @click="openModal"
    >
      <Camera class="size-5" />
    </div>
  </div>
</template>

<style scoped>
.screenshot-modal :deep(.vben-modal-content) {
  padding: 0;
}
</style>
