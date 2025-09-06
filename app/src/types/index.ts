// 作文批改相关的类型定义

export interface EssayDimension {
  score: number;
  comment: string;
}

export interface EssayAnalysisResult {
  overall_score: number;
  dimensions: {
    handwriting: EssayDimension;
    content: EssayDimension;
    structure: EssayDimension;
    language: EssayDimension;
  };
  highlights: string[];
  suggestions: string[];
  overall_comment: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface UploadedFile {
  file: File;
  preview: string;
  base64: string;
}

export interface AnalysisState {
  status: 'idle' | 'uploading' | 'analyzing' | 'completed' | 'error';
  progress: number;
  message: string;
  result?: EssayAnalysisResult;
  error?: string;
}

// 智谱API相关类型
export interface ZhipuMessage {
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

export interface ZhipuAPIRequest {
  model: string;
  messages: ZhipuMessage[];
  thinking?: {
    type: 'enabled' | 'disabled';
  };
  stream?: boolean;
}

export interface ZhipuAPIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}