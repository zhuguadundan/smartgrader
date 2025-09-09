/**
 * 结果验证工具
 * 验证AI返回的作文批改结果格式是否正确
 */

import type { EssayAnalysisResult } from '@/types';

// 定义验证结果的类型
interface ValidationResult {
  isValid: boolean;
  error?: string;
  data?: EssayAnalysisResult;
}

/**
 * 验证AI返回的结果格式
 * @param content - AI返回的内容
 * @returns 验证结果
 */
export function validateEssayResult(content: string): ValidationResult {
  try {
    // 清理智谱GLM-4.5V返回的包装标签
    let cleanContent = content.trim();
    
    // 移除 <|begin_of_box|> 和 <|end_of_box|> 标签
    if (cleanContent.startsWith('<|begin_of_box|>')) {
      cleanContent = cleanContent.replace('<|begin_of_box|>', '').trim();
    }
    if (cleanContent.endsWith('<|end_of_box|>')) {
      cleanContent = cleanContent.replace('<|end_of_box|>', '').trim();
    }
    
    // 移除可能的其他包装标签或多余的文本
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }
    
    const result = JSON.parse(cleanContent);
    
    // 检查必需字段
    const requiredFields = ['overall_score', 'overall_comment', 'highlights', 'suggestions'];
    for (const field of requiredFields) {
      if (!(field in result)) {
        return { isValid: false, error: `缺少必需字段: ${field}` };
      }
    }

    // 检查可选字段
    const optionalFields = ['annotations'];
    for (const field of optionalFields) {
      if (field in result && !Array.isArray(result[field])) {
        return { isValid: false, error: `字段 ${field} 必须是数组` };
      }
    }

    // 检查评分范围
    if (result.overall_score < 60 || result.overall_score > 100) {
      return { isValid: false, error: '总分超出有效范围(60-100)' };
    }

    return { isValid: true, data: result as EssayAnalysisResult };
  } catch {
    return { isValid: false, error: 'JSON格式错误' };
  }
}