
// TS 方法实现过滤 React 和 Antd 常见控制台警告
// https://github.com/ant-design/pro-components/discussions/8837
// utils/setupGlobalErrorHandling.ts

// 类型定义
type ErrorInfo = string;
type ErrorHandlerFunction = (
  error: Error | unknown,
  errorInfo: ErrorInfo
) => void;

interface GlobalErrorHandlingResult {
  ExtendedError: typeof ExtendedError;
  handleError: ErrorHandlerFunction;
}

interface ErrorHandlingConfig {
  maxErrorsPerSecond: number;
  enableConsoleOverride: boolean;
  ignoredWarnings: typeof IGNORED_WARNING_MESSAGES;
}

// 扩展全局 Error 构造函数的类型定义
declare global {
  interface ErrorConstructor {
    captureStackTrace?(targetObject: object, constructorOpt?: Function): void;
  }
}

// 扩展的错误类
class ExtendedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// 简化的警告配置，直接添加需要忽略的消息字符串即可
const IGNORED_WARNING_MESSAGES = [
  "`bordered` is deprecated",
  "Warning: findDOMNode is deprecated",
  // 在这里直接添加新的警告消息
  "Warning: StrictMode double-invocation",
  "Warning: Cannot update a component while rendering a different component",
  "[antd: Form.Item] `children` is array",
  'Caught an error: Error: Could not find source file',
  'Warning: React does not recognize the',
  'Could not find source file',
  'validateDOMNesting'
] as const;

// 默认配置
const DEFAULT_CONFIG: ErrorHandlingConfig = {
  maxErrorsPerSecond: 10,
  enableConsoleOverride: true,
  ignoredWarnings: IGNORED_WARNING_MESSAGES,
};

// 简化的警告过滤器
class WarningFilter {
  static shouldIgnore(message: unknown): boolean {
    if (typeof message !== "string") return false;

    return IGNORED_WARNING_MESSAGES.some((warningMsg) =>
      message.includes(warningMsg)
    );
  }
}

// 错误限流器
class ErrorThrottler {
  private errorCount = 0;
  private lastErrorTime = 0;

  constructor(private readonly maxErrorsPerSecond: number) {}

  shouldThrottle(): boolean {
    const now = Date.now();
    if (now - this.lastErrorTime > 1000) {
      this.errorCount = 0;
      this.lastErrorTime = now;
    }

    if (this.errorCount >= this.maxErrorsPerSecond) {
      return true;
    }

    this.errorCount++;
    return false;
  }
}

// 错误处理器
class ErrorHandler {
  private isHandlingError = false;
  private readonly throttler: ErrorThrottler;

  constructor(
    private readonly customHandler?: ErrorHandlerFunction,
    maxErrorsPerSecond: number = 10
  ) {
    this.throttler = new ErrorThrottler(maxErrorsPerSecond);
  }

  private defaultHandler: ErrorHandlerFunction = (error, errorInfo) => {
    console.error("Caught an error:", error, errorInfo);
  };

  handle(error: Error | unknown, errorInfo: ErrorInfo): void {
    if (this.throttler.shouldThrottle()) {
      console.warn("Too many errors, throttling error handling");
      return;
    }

    if (this.isHandlingError) {
      console.warn(
        "Error occurred while handling another error, skipping to prevent potential infinite loop"
      );
      return;
    }

    this.isHandlingError = true;
    try {
      if (this.customHandler) {
        this.customHandler(error, errorInfo);
      } else {
        this.defaultHandler(error, errorInfo);
      }
    } catch (handlerError) {
      console.error("Error occurred in error handler:", handlerError);
    } finally {
      this.isHandlingError = false;
    }
  }
}

/**
 * @description: 全局运行时异常处理
 * @param {ErrorHandlerFunction} customErrorHandler
 * @param {Partial<ErrorHandlingConfig>} config
 */
export const setupGlobalErrorHandling = (
  customErrorHandler?: ErrorHandlerFunction,
  config: Partial<ErrorHandlingConfig> = {}
): GlobalErrorHandlingResult => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const errorHandler = new ErrorHandler(
    customErrorHandler,
    finalConfig.maxErrorsPerSecond
  );

  // 设置 window.onerror 处理器
  window.onerror = (message, source, lineno, colno, error) => {
    errorHandler.handle(
      error || new Error(message as string),
      `window.onerror: ${source}:${lineno}:${colno}`
    );
    return true;
  };

  // 设置 unhandledrejection 事件处理器
  window.addEventListener("unhandledrejection", (event) => {
    errorHandler.handle(event.reason, "unhandledPromiseRejection");
  });

  if (finalConfig.enableConsoleOverride) {
    // 重写 console 方法
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.warn = (...args) => {
      if (WarningFilter.shouldIgnore(args[0])) return;
      originalConsoleWarn.apply(console, args);
    };

    console.error = (...args) => {
      if (WarningFilter.shouldIgnore(args[0])) return;
      errorHandler.handle(
        args[0] instanceof Error ? args[0] : new Error(args.join(" ")),
        "console.error"
      );
      originalConsoleError.apply(console, args);
    };
  }

  return {
    ExtendedError,
    handleError: errorHandler.handle.bind(errorHandler),
  };
};
