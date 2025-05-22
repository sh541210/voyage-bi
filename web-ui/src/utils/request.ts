import { message } from 'antd'
import axios, { AxiosRequestConfig } from 'axios'
import { setupInterceptors } from './login/interceptor'

const service = setupInterceptors(axios.create({
  baseURL: '/api',
  timeout: 60000
}))

export interface Result<T = any> {
  message: string
  data: T
  code: string
  success: boolean
}
interface RequestConfig extends AxiosRequestConfig {
  ignoreTip?: boolean
}

const requestResult = async <T = any>(config: RequestConfig): Promise<Result<T>> => {
  try {
    const { data } = await service.request<Result>(config)
    return data
  } catch (error) {
    const message = (error as any).message || 'Request error'
    const res: Result<any> = {
      code: "-1",
      message,
      data: null as any,
      success: false
    }
    return res
  }
}

const requstData = async <T = any>(config: RequestConfig): Promise<T> => {
  return new Promise<T>((res, rej) => {
    return requestResult(config).then((result) => {
      if (result.success) {
        res(result.data)
      } else {
        if (result.code !== '101' && !config.ignoreTip) {
          message.error(result.message)
        }
        rej(result.message)
      }
    })
  })
}

const GET = async <T = any>(url: string, config?: RequestConfig): Promise<T> => requstData({ url, method: 'GET', ...config })
const POST = async <T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> =>
  requstData({ url, method: 'POST', data, ...config })
const PUT = async <T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> =>
  requstData({ url, method: 'PUT', data, ...config })
const DELETE = async <T = any>(url: string, config?: RequestConfig): Promise<T> =>
  requstData({ url, method: 'DELETE', ...config })

const EXPORT = async <T = any>(fileName: string, url: string, data?: any, config?: RequestConfig): Promise<void> => {
  if (!fileName || fileName === '') {
    fileName = '导出文件'
  }
  try {
    const response = await service.post(url, data, {
      responseType: 'blob',
      ...config,
    });

    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName + '.xlsx'; // 可以根据需要设置文件名
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    message.error((error as any).message || 'Export error');
  }
}

export default {
  GET,
  POST,
  PUT,
  DELETE,
  EXPORT
}
