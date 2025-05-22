import React, { Component } from 'react';

// 自定义错误边界组件，支持传入标题
interface ErrorBoundaryProps {
  title?: string;  // 可选标题，默认值为 "Something went wrong"
  children: React.ReactNode;  // 错误边界包裹的子组件
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error) {
    // 当发生错误时，更新状态来显示回退 UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误信息（你可以将错误信息发送到日志服务）
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    console.error("Caught by Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 使用传入的标题，若没有传入则使用默认标题
      const { title = "Something went wrong" } = this.props;
      
      return (
        <div className='p-2 text-red-400'>
          <h1>{title}</h1>  {/* 渲染传入的标题 */}
          <details className=' text-sm' style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Click to view error details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    // 正常渲染子组件
    return this.props.children;
  }
}