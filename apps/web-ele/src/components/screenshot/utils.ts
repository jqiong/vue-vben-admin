import html2canvas from 'html2canvas';

/**
 * 截取当前可见区域
 * @param element 目标元素
 * @returns Canvas 元素
 */
export async function captureScreenshot(element: HTMLElement): Promise<HTMLCanvasElement> {
  const canvas = await html2canvas(element, {
    allowTaint: true,
    backgroundColor: null,
    ignoreElements: (el) => {
      // 忽略固定定位的元素（如顶部导航栏）
      const style = window.getComputedStyle(el);
      return style.position === 'fixed' && style.top === '0px';
    },
    logging: false,
    scale: window.devicePixelRatio || 1,
    useCORS: true,
  });

  return canvas;
}

/**
 * 截取完整页面（包含滚动区域）
 * @param element 目标元素
 * @returns Canvas 元素
 */
export async function captureFullPageScreenshot(element: HTMLElement): Promise<HTMLCanvasElement> {
  // 保存原始样式
  const originalStyle = {
    height: element.style.height,
    overflow: element.style.overflow,
    position: element.style.position,
  };

  // 获取滚动信息
  const scrollWidth = element.scrollWidth;
  const scrollHeight = element.scrollHeight;
  const clientWidth = element.clientWidth;
  const clientHeight = element.clientHeight;

  // 检查是否需要滚动截图
  const needsScrolling = scrollHeight > clientHeight || scrollWidth > clientWidth;

  if (!needsScrolling) {
    // 如果不需要滚动，直接截取当前屏
    return captureScreenshot(element);
  }

  // 临时修改元素样式以捕获完整内容
  element.style.height = `${scrollHeight}px`;
  element.style.overflow = 'visible';

  try {
    const canvas = await html2canvas(element, {
      allowTaint: true,
      backgroundColor: null,
      height: scrollHeight,
      ignoreElements: (el) => {
        // 忽略固定定位的元素
        const style = window.getComputedStyle(el);
        return style.position === 'fixed' && style.top === '0px';
      },
      logging: false,
      scale: window.devicePixelRatio || 1,
      useCORS: true,
      width: scrollWidth,
      x: 0,
      y: 0,
    });

    return canvas;
  } finally {
    // 恢复原始样式
    element.style.height = originalStyle.height;
    element.style.overflow = originalStyle.overflow;
    element.style.position = originalStyle.position;
  }
}

/**
 * 将 Canvas 转换为图片并下载
 * @param canvas Canvas 元素
 * @param filename 文件名
 */
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
