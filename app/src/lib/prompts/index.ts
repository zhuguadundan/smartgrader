/**
 * Prompt模块统一导出
 * 提供向后兼容的API，同时支持模块化导入
 */

// 重新导出所有模块的内容
export * from './basic';
export * from './grade-specific';
export * from './genre-specific';
export * from './scoring-criteria';
export * from './encouraging-phrases';
export * from './generator';
export * from './validator';