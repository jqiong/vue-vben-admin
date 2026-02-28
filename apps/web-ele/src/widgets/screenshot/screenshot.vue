<script lang="ts" setup>
import { ref } from 'vue';

import { createIconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { ElIcon, ElPopover } from 'element-plus';

import html2canvas from 'html2canvas';

const CameraIcon = createIconifyIcon('lucide:camera');
const Maximize2Icon = createIconifyIcon('lucide:maximize-2');

defineOptions({ name: 'ScreenshotWidget' });

const visible = ref(false);
const isCapturing = ref(false);

async function captureCurrentScreen() {
  visible.value = false;
  isCapturing.value = true;

  try {
    const targetElement = document.querySelector('.vben-layout-content') as HTMLElement;
    if (!targetElement) {
      console.error('Target element not found');
      return;
    }

    const canvas = await html2canvas(targetElement, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: window.devicePixelRatio || 1,
    });

    downloadImage(canvas, `screenshot-${Date.now()}.png`);
  } catch (error) {
    console.error('Screenshot failed:', error);
  } finally {
    isCapturing.value = false;
  }
}

async function captureScrollScreen() {
  visible.value = false;
  isCapturing.value = true;

  try {
    const targetElement = document.querySelector('.vben-layout-content') as HTMLElement;
    if (!targetElement) {
      console.error('Target element not found');
      return;
    }

    const hasScroll = targetElement.scrollHeight > targetElement.clientHeight;

    if (!hasScroll) {
      await captureCurrentScreen();
      return;
    }

    const originalOverflow = targetElement.style.overflow;
    const originalHeight = targetElement.style.height;

    targetElement.style.overflow = 'visible';
    targetElement.style.height = 'auto';

    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(targetElement, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: window.devicePixelRatio || 1,
      windowHeight: targetElement.scrollHeight,
    });

    targetElement.style.overflow = originalOverflow;
    targetElement.style.height = originalHeight;

    downloadImage(canvas, `screenshot-scroll-${Date.now()}.png`);
  } catch (error) {
    console.error('Scroll screenshot failed:', error);
  } finally {
    isCapturing.value = false;
  }
}

function downloadImage(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
</script>

<template>
  <ElPopover
    v-model:visible="visible"
    placement="bottom"
    :width="180"
    trigger="hover"
  >
    <template #reference>
      <div
        class="flex-center mr-2 h-full cursor-pointer"
        :class="{ 'opacity-50': isCapturing }"
      >
        <ElIcon :size="18" class="text-foreground hover:text-primary">
          <CameraIcon />
        </ElIcon>
      </div>
    </template>

    <div class="flex flex-col gap-1">
      <div
        class="hover:bg-gray-100 dark:hover:bg-gray-700 flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm"
        @click="captureCurrentScreen"
      >
        <ElIcon :size="16">
          <CameraIcon />
        </ElIcon>
        <span>{{ $t('page.screenshot.currentScreen') }}</span>
      </div>
      <div
        class="hover:bg-gray-100 dark:hover:bg-gray-700 flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm"
        @click="captureScrollScreen"
      >
        <ElIcon :size="16">
          <Maximize2Icon />
        </ElIcon>
        <span>{{ $t('page.screenshot.scrollScreen') }}</span>
      </div>
    </div>
  </ElPopover>
</template>
