# Prompt模块化重构说明

## 概述

为了便于后续调试和分析报告，已将原本的单一`prompts.ts`文件拆分为多个模块化文件。这种结构使得不同类型的Prompt更容易维护、调试和扩展。

## 新的文件结构

```
src/lib/prompts/
├── index.ts                 # 统一导出文件，保持向后兼容
├── basic.ts                 # 基础作文批改Prompt模板
├── grade-specific.ts        # 年级特定的Prompt模板
├── genre-specific.ts        # 文体特定的Prompt模板
├── scoring-criteria.ts      # 评分标准配置
├── encouraging-phrases.ts   # 鼓励性评语模板
├── generator.ts             # Prompt生成器和工具函数
└── validator.ts             # 结果验证工具
```

## 各模块功能说明

### 1. basic.ts - 基础模板
包含通用的作文批改指令和JSON格式要求，适用于大部分场景。

### 2. grade-specific.ts - 年级特定模板
针对不同年级（3-6年级）学生的写作水平和评价标准：
- 三年级：重点关注基础表达和字迹工整
- 四年级：关注内容具体性和段落划分
- 五年级：强调结构完整性和语言丰富性
- 六年级：要求内容深度和文采表现

### 3. genre-specific.ts - 文体特定模板
针对不同文体类型的评价重点：
- 记叙文：事件完整性、情节生动性
- 写景/状物文：观察细致度、描写生动性
- 说明文：条理清晰度、语言准确性
- 议论文：观点明确性、论证合理性

### 4. scoring-criteria.ts - 评分标准
定义四个评价维度的分数区间和描述：
- 字迹工整度 (handwriting)
- 内容丰富度 (content)
- 结构清晰度 (structure)
- 语言表达力 (language)

### 5. encouraging-phrases.ts - 鼓励性评语
提供积极正面的评价用语模板：
- 开场白
- 表扬用语
- 建议用语
- 结束语

### 6. generator.ts - Prompt生成器
提供`generateCustomPrompt`函数，支持根据以下参数动态生成Prompt：
- `grade`: 年级 (3-6)
- `genre`: 文体类型
- `focus`: 重点关注项
- `difficulty`: 难度级别

### 7. validator.ts - 结果验证器
提供`validateEssayResult`函数，验证AI返回结果的格式正确性：
- 清理智谱GLM-4.5V的包装标签
- 验证必需字段完整性
- 检查评分范围合理性

## 使用方式

### 向后兼容
原有的导入方式仍然有效：
```typescript
import { BASIC_ESSAY_PROMPT, generateCustomPrompt, validateEssayResult } from '@/lib/prompts';
```

### 模块化导入
现在也可以按需导入特定模块：
```typescript
import { BASIC_ESSAY_PROMPT } from '@/lib/prompts/basic';
import { GRADE_SPECIFIC_PROMPTS } from '@/lib/prompts/grade-specific';
import { generateCustomPrompt } from '@/lib/prompts/generator';
```

## 调试优势

1. **独立测试**: 每个模块可以独立测试和调试
2. **精确定位**: 问题可以快速定位到具体的Prompt类型
3. **灵活组合**: 可以灵活组合不同模块的Prompt
4. **版本控制**: 不同类型的Prompt修改历史更清晰
5. **团队协作**: 多人可以同时维护不同类型的Prompt

## 扩展建议

未来可以考虑添加以下模块：
- `subject-specific.ts`: 针对不同学科的作文Prompt
- `season-specific.ts`: 针对不同季节/节日的作文Prompt
- `difficulty-levels.ts`: 更细化的难度级别配置
- `feedback-templates.ts`: 更丰富的反馈模板

## 注意事项

1. 所有模块都通过`index.ts`统一导出，保持API一致性
2. 原有的`prompts.ts`文件已更新为重新导出模块化组件
3. 开发服务器已验证无编译错误
4. 所有现有功能保持不变，只是内部结构更加清晰