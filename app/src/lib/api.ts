import type { APIResponse, EssayAnalysisResult, UploadedFile } from '@/types';
import { AppError, handleNetworkError, handleAPIError, withRetry, withTimeout } from './store';

// API配置
const API_CONFIG = {
  timeout: 30000, // 30秒超时
  maxRetries: 2,
  retryDelay: 1000,
};

/**
 * 增强的fetch函数，包含错误处理和重试机制
 */
async function enhancedFetch(
  url: string,
  options: RequestInit = {},
  useRetry = true
): Promise<Response> {
  const fetchFn = async () => {
    // Don't set Content-Type for FormData - let browser handle it
    const headers: Record<string, string> = {};
    
    // Only set Content-Type to application/json if body is not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw handleAPIError(response, data);
    }

    return response;
  };

  try {
    if (useRetry) {
      return await withTimeout(
        withRetry(fetchFn, API_CONFIG.maxRetries, API_CONFIG.retryDelay),
        API_CONFIG.timeout
      );
    } else {
      return await withTimeout(fetchFn(), API_CONFIG.timeout);
    }
  } catch (error) {
    throw handleNetworkError(error);
  }
}

/**
 * 上传文件到服务器
 * @param file - 要上传的文件
 * @returns Promise<APIResponse<UploadedFile>>
 */
export async function uploadFile(file: File): Promise<APIResponse<UploadedFile>> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await enhancedFetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // 让浏览器自动设置Content-Type for FormData
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('文件上传失败:', error);
    
    if (error instanceof AppError) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: '网络错误，请检查网络连接',
    };
  }
}

/**
 * 分析作文
 * @param imageBase64 - Base64编码的图片数据
 * @param options - 分析选项
 * @returns Promise<APIResponse<EssayAnalysisResult>>
 */
export async function analyzeEssay(
  imageBase64: string,
  options: {
    grade?: 3 | 4 | 5 | 6;
    genre?: 'narrative' | 'descriptive' | 'expository' | 'argumentative';
    focus?: string[];
    difficulty?: 'easy' | 'normal' | 'hard';
  } = {}
): Promise<APIResponse<EssayAnalysisResult>> {
  try {
    const response = await enhancedFetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, options }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('作文分析失败:', error);
    
    if (error instanceof AppError) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: '网络错误，请检查网络连接',
    };
  }
}

/**
 * 测试API连接
 * @returns Promise<APIResponse<any>>
 */
export async function testAPIConnection(): Promise<APIResponse<{ status: string; timestamp: string }>> {
  try {
    const response = await enhancedFetch('/api/test', {
      method: 'GET',
    }, false); // 不使用重试机制

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API连接测试失败:', error);
    
    if (error instanceof AppError) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: 'API连接失败',
    };
  }
}

/**
 * 将文件转换为Base64格式
 * @param file - 要转换的文件
 * @returns Promise<string> - Base64编码的数据URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new AppError('文件读取失败'));
      }
    };
    reader.onerror = () => reject(new AppError('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 验证文件是否符合要求
 * @param file - 要验证的文件
 * @returns { valid: boolean; error?: string }
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: '不支持的文件格式，请上传 JPG 或 PNG 格式的图片',
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: '文件大小超过限制，请上传小于 10MB 的图片',
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: '文件为空，请选择有效的图片文件',
    };
  }

  return { valid: true };
}

/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 检查网络连接状态
 * @returns boolean
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * 等待网络连接恢复
 * @param timeout - 超时时间（毫秒）
 * @returns Promise<boolean>
 */
export function waitForOnline(timeout = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      resolve(false);
    }, timeout);

    const onlineHandler = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', onlineHandler);
      resolve(true);
    };

    window.addEventListener('online', onlineHandler);
  });
}

/**
 * 获取错误的用户友好消息
 * @param error - 错误对象
 * @returns 用户友好的错误消息
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return '发生了未知错误，请重试';
}