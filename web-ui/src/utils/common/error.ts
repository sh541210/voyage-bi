// 用于缓存错误信息的 Map
const errorCache = new Map<string, number>();

interface ShowErrorOptions {
  message: string;       // 错误信息
  key?: string;          // 错误唯一标识（默认用 message）
  duration?: number;     // 多久内重复错误不再显示（毫秒），默认 3000
  onShow?: (msg: string) => void; // 自定义显示函数
}

/**
 * 显示去重后的错误
 */
export function showErrorOnce({
  message,
  key,
  duration = 3000,
  onShow = (msg) => {
    // 默认直接打印，实际项目里可替换为 antd message.error
    console.error(msg);
  },
}: ShowErrorOptions) {
  const now = Date.now();
  const cacheKey = key || message;

  // 如果短时间内已出现过相同错误，则跳过
  const lastTime = errorCache.get(cacheKey);
  if (lastTime && now - lastTime < duration) {
    return;
  }

  // 记录并显示错误
  errorCache.set(cacheKey, now);
  onShow(message);

  // 设置过期清理
  setTimeout(() => {
    errorCache.delete(cacheKey);
  }, duration);
}