import type { ZhipuAPIRequest, ZhipuAPIResponse } from '@/types';

// 智谱API配置
export const ZHIPU_CONFIG = {
  API_KEY: process.env.ZHIPU_API_KEY,
  BASE_URL: process.env.API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
  TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000'),
  FALLBACK_MODEL: process.env.ZHIPU_FALLBACK_MODEL || 'glm-4v',
  PRIMARY_MODEL: 'glm-4.5v',
};

// 错误类型定义
export class ZhipuAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ZhipuAPIError';
  }
}

/**
 * 智谱API调用服务类
 */
export class ZhipuAPIService {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor() {
    if (!ZHIPU_CONFIG.API_KEY) {
      throw new Error('智谱API Key未配置');
    }
    
    this.apiKey = ZHIPU_CONFIG.API_KEY;
    this.baseUrl = ZHIPU_CONFIG.BASE_URL;
    this.timeout = ZHIPU_CONFIG.TIMEOUT;
  }

  /**
   * 调用智谱API
   * @param request - API请求参数
   * @param useFallback - 是否使用备用模型
   * @returns Promise<ZhipuAPIResponse>
   */
  async callAPI(
    request: ZhipuAPIRequest,
    useFallback = false
  ): Promise<ZhipuAPIResponse> {
    // 如果使用备用模型，修改模型名称
    if (useFallback) {
      request.model = ZHIPU_CONFIG.FALLBACK_MODEL;
    }

    const url = `${this.baseUrl}/chat/completions`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ZhipuAPIError(
          this.getErrorMessage(response.status, errorData),
          response.status,
          errorData.error?.code
        );
      }

      const result: ZhipuAPIResponse = await response.json();
      
      // 验证响应格式
      if (!result.choices || result.choices.length === 0) {
        throw new ZhipuAPIError('API返回格式异常：缺少choices字段');
      }

      return result;
    } catch (error) {
      if (error instanceof ZhipuAPIError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ZhipuAPIError('请求超时', 408);
      }
      
      throw new ZhipuAPIError(
        `API调用失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 带重试和降级的API调用
   * @param request - API请求参数
   * @param maxRetries - 最大重试次数
   * @returns Promise<ZhipuAPIResponse>
   */
  async callWithRetry(
    request: ZhipuAPIRequest,
    maxRetries = 2
  ): Promise<ZhipuAPIResponse> {
    let lastError: ZhipuAPIError | null = null;

    // 首先尝试主模型
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.callAPI(request, false);
      } catch (error) {
        lastError = error instanceof ZhipuAPIError ? error : 
          new ZhipuAPIError(`尝试 ${attempt + 1} 失败: ${error}`);
        
        // 如果是认证错误或配置错误，不重试
        if (lastError.status === 401 || lastError.status === 403) {
          throw lastError;
        }
        
        // 最后一次尝试失败后，不再重试
        if (attempt === maxRetries) {
          break;
        }
        
        // 等待一段时间后重试（指数退避）
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    // 如果主模型失败，尝试备用模型
    if (lastError) {
      console.warn('主模型调用失败，尝试备用模型:', lastError.message);
      
      try {
        return await this.callAPI(request, true);
      } catch (fallbackError) {
        // 如果备用模型也失败，抛出原始错误
        throw lastError;
      }
    }

    // 这种情况理论上不应该发生
    throw new ZhipuAPIError('未知错误：所有重试都失败了');
  }

  /**
   * 流式调用智谱API
   * @param request - API请求参数
   * @param onChunk - 处理流式数据的回调函数
   * @returns Promise<void>
   */
  async callStream(
    request: ZhipuAPIRequest,
    onChunk: (content: string) => void
  ): Promise<void> {
    const streamRequest = { ...request, stream: true };
    const url = `${this.baseUrl}/chat/completions`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(streamRequest),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ZhipuAPIError(
          this.getErrorMessage(response.status, errorData),
          response.status
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new ZhipuAPIError('无法读取流式响应');
      }

      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                return;
              }
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  onChunk(content);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof ZhipuAPIError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ZhipuAPIError('流式请求超时', 408);
      }
      
      throw new ZhipuAPIError(
        `流式调用失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 获取错误信息
   * @param status - HTTP状态码
   * @param errorData - 错误数据
   * @returns 用户友好的错误信息
   */
  private getErrorMessage(status: number, errorData: any): string {
    switch (status) {
      case 400:
        return '请求参数错误';
      case 401:
        return 'API密钥无效或已过期';
      case 403:
        return '访问被拒绝，请检查权限';
      case 429:
        return '请求过于频繁，请稍后重试';
      case 500:
        return '服务器内部错误';
      case 502:
      case 503:
      case 504:
        return '服务暂时不可用，请稍后重试';
      default:
        return errorData.error?.message || `API调用失败 (${status})`;
    }
  }

  /**
   * 延迟函数
   * @param ms - 延迟毫秒数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 记录API使用情况
   * @param usage - 使用情况数据
   */
  logUsage(usage: ZhipuAPIResponse['usage']): void {
    if (usage) {
      console.log('API使用情况:', {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// 导出单例实例
let zhipuService: ZhipuAPIService | null = null;

export function getZhipuService(): ZhipuAPIService {
  if (!zhipuService) {
    zhipuService = new ZhipuAPIService();
  }
  return zhipuService;
}