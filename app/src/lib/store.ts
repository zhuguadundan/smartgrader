/**
 * 全局错误处理和状态管理
 */

import { create } from 'zustand';
import type { EssayAnalysisResult, AnalysisState } from '@/types';

// 应用状态接口
interface AppState {
  // 分析状态
  analysisState: AnalysisState;
  analysisResult: EssayAnalysisResult | null;
  
  // 错误状态
  globalError: string | null;
  
  // 加载状态
  isLoading: boolean;
  loadingMessage: string;
  
  // 统计信息
  stats: {
    totalAnalyses: number;
    totalTokensUsed: number;
    totalCost: number;
    lastAnalysisTime: string | null;
  };
  
  // Actions
  setAnalysisState: (state: Partial<AnalysisState>) => void;
  setAnalysisResult: (result: EssayAnalysisResult | null) => void;
  setGlobalError: (error: string | null) => void;
  setLoading: (loading: boolean, message?: string) => void;
  updateStats: (usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }) => void;
  resetState: () => void;
}

// 创建状态管理store
export const useAppStore = create<AppState>((set, get) => ({
  // 初始状态
  analysisState: {
    status: 'idle',
    progress: 0,
    message: '',
  },
  analysisResult: null,
  globalError: null,
  isLoading: false,
  loadingMessage: '',
  stats: {
    totalAnalyses: 0,
    totalTokensUsed: 0,
    totalCost: 0,
    lastAnalysisTime: null,
  },

  // Actions
  setAnalysisState: (newState) =>
    set((state) => ({
      analysisState: { ...state.analysisState, ...newState },
    })),

  setAnalysisResult: (result) =>
    set({ analysisResult: result }),

  setGlobalError: (error) =>
    set({ globalError: error }),

  setLoading: (loading, message = '') =>
    set({ isLoading: loading, loadingMessage: message }),

  updateStats: (usage) =>
    set((state) => ({
      stats: {
        ...state.stats,
        totalAnalyses: state.stats.totalAnalyses + 1,
        totalTokensUsed: state.stats.totalTokensUsed + usage.total_tokens,
        totalCost: state.stats.totalCost + calculateCost(usage),
        lastAnalysisTime: new Date().toISOString(),
      },
    })),

  resetState: () =>
    set({
      analysisState: {
        status: 'idle',
        progress: 0,
        message: '',
      },
      analysisResult: null,
      globalError: null,
      isLoading: false,
      loadingMessage: '',
    }),
}));

// 计算成本（估算）
function calculateCost(usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }): number {
  // 智谱GLM-4.5V的价格（估算，实际价格请参考官方）
  const INPUT_PRICE_PER_1K = 0.05; // 输入token价格
  const OUTPUT_PRICE_PER_1K = 0.15; // 输出token价格
  
  const inputCost = (usage.prompt_tokens / 1000) * INPUT_PRICE_PER_1K;
  const outputCost = (usage.completion_tokens / 1000) * OUTPUT_PRICE_PER_1K;
  
  return inputCost + outputCost;
}

// 错误处理工具函数
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 错误处理函数
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message);
  }
  
  return new AppError('未知错误');
}

// 网络错误处理
export function handleNetworkError(error: unknown): AppError {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppError('网络连接失败，请检查网络设置', 'NETWORK_ERROR');
  }
  
  return handleError(error);
}

// API响应错误处理
export function handleAPIError(response: Response, data?: Record<string, unknown>): AppError {
  const message = (data?.error as string) || `请求失败 (${response.status})`;
  
  switch (response.status) {
    case 400:
      return new AppError(message, 'BAD_REQUEST', 400);
    case 401:
      return new AppError('认证失败，请检查API配置', 'UNAUTHORIZED', 401);
    case 403:
      return new AppError('访问被拒绝', 'FORBIDDEN', 403);
    case 429:
      return new AppError('请求过于频繁，请稍后重试', 'RATE_LIMIT', 429);
    case 500:
      return new AppError('服务器内部错误', 'INTERNAL_ERROR', 500);
    default:
      return new AppError(message, 'API_ERROR', response.status);
  }
}

// 重试机制
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }
      
      // 指数退避
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }
  
  throw lastError!;
}

// 超时处理
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new AppError('请求超时', 'TIMEOUT')), timeoutMs)
    ),
  ]);
}