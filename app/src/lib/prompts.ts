/**
 * 作文批改Prompt模板管理
 * 重新导出模块化的Prompt组件，保持向后兼容性
 * 
 * 新的模块化结构：
 * - prompts/basic.ts - 基础模板
 * - prompts/grade-specific.ts - 年级特定模板
 * - prompts/genre-specific.ts - 文体特定模板
 * - prompts/scoring-criteria.ts - 评分标准
 * - prompts/encouraging-phrases.ts - 鼓励性评语
 * - prompts/generator.ts - Prompt生成器
 * - prompts/validator.ts - 结果验证器
 */

// 重新导出所有模块化的Prompt组件
export * from './prompts/index';