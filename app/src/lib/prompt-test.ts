/**
 * Prompt测试和优化工具
 * 用于测试不同Prompt的效果和优化策略
 */

import { generateCustomPrompt, validateEssayResult, ENCOURAGING_PHRASES } from './prompts';
import type { GradeLevel } from '@/types';

// 测试用例数据
export const TEST_CASES = {
  grade3_narrative: {
    description: '三年级记叙文 - 我的一天',
    options: { grade: 'grade-3' as GradeLevel, genre: 'narrative' as const },
    expectedScore: { min: 65, max: 85 },
    expectedFeatures: ['简单鼓励', '基础评价', '易懂建议']
  },
  grade5_descriptive: {
    description: '五年级写景作文 - 美丽的校园',
    options: { grade: 'grade-5' as GradeLevel, genre: 'descriptive' as const },
    expectedScore: { min: 70, max: 95 },
    expectedFeatures: ['详细分析', '修辞评价', '深度建议']
  },
  grade6_argumentative: {
    description: '六年级议论文 - 读书的重要性',
    options: { grade: 'grade-6' as GradeLevel, genre: 'argumentative' as const, difficulty: 'hard' as const },
    expectedScore: { min: 75, max: 100 },
    expectedFeatures: ['逻辑分析', '论证评价', '高标准要求']
  }
};

/**
 * 测试Prompt生成功能
 */
export function testPromptGeneration(): void {
  console.log('=== Prompt生成测试 ===\n');
  
  Object.entries(TEST_CASES).forEach(([key, testCase]) => {
    console.log(`测试用例: ${testCase.description}`);
    console.log('配置:', testCase.options);
    
    const prompt = generateCustomPrompt(testCase.options);
    console.log('生成的Prompt长度:', prompt.length);
    console.log('包含年级特定内容:', prompt.includes('年级'));
    console.log('包含文体特定内容:', testCase.options.genre ? prompt.includes('记叙文') || prompt.includes('写景') || prompt.includes('议论文') : false);
    console.log('---\n');
  });
}

/**
 * 模拟AI响应并测试验证功能
 */
export function testResponseValidation(): void {
  console.log('=== 响应验证测试 ===\n');
  
  // 正确格式的响应
  const validResponse = JSON.stringify({
    overall_score: 85,
    dimensions: {
      handwriting: { score: 80, comment: '字迹工整' },
      content: { score: 90, comment: '内容丰富' },
      structure: { score: 85, comment: '结构清晰' },
      language: { score: 85, comment: '语言生动' }
    },
    highlights: ['想象丰富', '情感真实'],
    suggestions: ['注意标点符号', '多用修辞手法'],
    overall_comment: '这是一篇很好的作文！'
  });
  
  const validation1 = validateEssayResult(validResponse);
  console.log('有效响应验证:', validation1.isValid ? '✅ 通过' : '❌ 失败');
  
  // 无效格式的响应
  const invalidResponse = '这不是一个JSON格式的响应';
  const validation2 = validateEssayResult(invalidResponse);
  console.log('无效响应验证:', validation2.isValid ? '❌ 应该失败' : '✅ 正确识别');
  
  // 缺少字段的响应
  const incompleteResponse = JSON.stringify({
    overall_score: 85,
    dimensions: {
      handwriting: { score: 80, comment: '字迹工整' }
      // 缺少其他维度
    }
  });
  
  const validation3 = validateEssayResult(incompleteResponse);
  console.log('不完整响应验证:', validation3.isValid ? '❌ 应该失败' : '✅ 正确识别');
  console.log('错误信息:', validation3.error);
  console.log('---\n');
}

/**
 * 生成评语示例
 */
export function generateSampleComments(): void {
  console.log('=== 评语示例生成 ===\n');
  
  const sampleComment = [
    ENCOURAGING_PHRASES.opening[0],
    ENCOURAGING_PHRASES.praise[0] + '，' + ENCOURAGING_PHRASES.praise[1] + '。',
    ENCOURAGING_PHRASES.suggestions[0].replace('...', '描写细节'),
    ENCOURAGING_PHRASES.closing[0]
  ].join(' ');
  
  console.log('示例评语:', sampleComment);
  console.log('---\n');
}

/**
 * Prompt优化建议
 */
export function getPromptOptimizationTips(): string[] {
  return [
    '1. 根据学生年级调整语言难度和评价标准',
    '2. 针对不同文体突出相应的评价重点',
    '3. 使用具体的评价标准，避免模糊表述',
    '4. 平衡鼓励和建设性批评，保持积极语调',
    '5. 提供可操作的具体改进建议',
    '6. 确保JSON格式的严格性和完整性',
    '7. 考虑学生的心理接受能力，避免过于严厉',
    '8. 结合教学大纲要求，确保评价的教育意义'
  ];
}

/**
 * 运行所有测试
 */
export function runAllTests(): void {
  console.log('🚀 开始Prompt系统测试...\n');
  
  testPromptGeneration();
  testResponseValidation();
  generateSampleComments();
  
  console.log('📋 优化建议:');
  getPromptOptimizationTips().forEach(tip => console.log(tip));
  
  console.log('\n✅ 测试完成！');
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined' && require.main === module) {
  runAllTests();
}