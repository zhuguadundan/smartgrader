/**
 * Prompt生成器和工具函数
 * 提供动态生成定制化Prompt的功能
 */

import { BASIC_ESSAY_PROMPT } from './basic';
import { GRADE_SPECIFIC_PROMPTS } from './grade-specific';
import { GENRE_SPECIFIC_PROMPTS } from './genre-specific';

/**
 * 根据参数生成定制化的Prompt
 * @param options - 配置选项
 * @returns 生成的Prompt字符串
 */
export function generateCustomPrompt(options: {
  grade?: 3 | 4 | 5 | 6;
  genre?: 'narrative' | 'descriptive' | 'expository' | 'argumentative';
  focus?: string[];
  difficulty?: 'easy' | 'normal' | 'hard';
} = {}): string {
  const { grade, genre, focus, difficulty = 'normal' } = options;

  let prompt = BASIC_ESSAY_PROMPT;

  // 根据年级调整
  if (grade && GRADE_SPECIFIC_PROMPTS[`grade${grade}` as keyof typeof GRADE_SPECIFIC_PROMPTS]) {
    prompt = GRADE_SPECIFIC_PROMPTS[`grade${grade}` as keyof typeof GRADE_SPECIFIC_PROMPTS];
  }

  // 根据文体调整
  if (genre && GENRE_SPECIFIC_PROMPTS[genre]) {
    prompt += '\n\n特别注意：' + GENRE_SPECIFIC_PROMPTS[genre];
  }

  // 根据重点关注项调整
  if (focus && focus.length > 0) {
    prompt += '\n\n请特别关注以下方面：\n' + focus.map((item, index) => `${index + 1}. ${item}`).join('\n');
  }

  // 根据难度调整评分标准
  if (difficulty === 'easy') {
    prompt += '\n\n评分时请适当放宽标准，多给予鼓励。';
  } else if (difficulty === 'hard') {
    prompt += '\n\n评分时请适当提高标准，给出更具挑战性的建议。';
  }

  return prompt;
}