import { useState, useEffect, useCallback, useRef } from 'react';

type FullscreenHookReturnType<T extends HTMLElement> = {
  ref: React.RefObject<T | null>;
  isFullscreen: boolean;
  toggle: () => void;
};

const useAutoFullscreen = <T extends HTMLElement = HTMLDivElement>(
  options?: {
    hideSelector?: string;
    fullscreenClass?: string;
  }
): FullscreenHookReturnType<T> => {
  const ref = useRef<T>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 全屏切换逻辑
  const toggle = useCallback(async () => {
    const target = ref.current || document.documentElement;
    const elementsToHide = options?.hideSelector
      ? document.querySelectorAll(options.hideSelector)
      : [];

    try {
      if (!isFullscreen) {
        // 进入全屏
        await (target as any).requestFullscreen?.();

        // 应用样式和隐藏元素
        if (options?.fullscreenClass) {
          target.classList.add(options.fullscreenClass);
        }
        elementsToHide.forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });
      } else {
        // 退出全屏
        await document.exitFullscreen?.();

        // 恢复样式和元素
        if (options?.fullscreenClass) {
          target.classList.remove(options.fullscreenClass);
        }
        elementsToHide.forEach(el => {
          (el as HTMLElement).style.display = '';
        });
      }
      setIsFullscreen(!isFullscreen);
    } catch (err) {
      console.error('全屏操作失败:', err);
    }
  }, [isFullscreen, options]);

  // 监听全屏状态变化
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return { ref, isFullscreen, toggle };
};

export default useAutoFullscreen;