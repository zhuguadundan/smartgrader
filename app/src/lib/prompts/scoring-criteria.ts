/**
 * 评分标准和评价维度配置
 * 定义各个评价维度的分数区间和描述
 */

export const SCORING_CRITERIA = {
  handwriting: {
    excellent: { min: 90, description: '字迹工整美观，笔画规范' },
    good: { min: 80, description: '字迹较为工整，基本规范' },
    fair: { min: 70, description: '字迹一般，部分不够规范' },
    poor: { min: 60, description: '字迹潦草，需要改进' }
  },
  content: {
    excellent: { min: 90, description: '内容充实生动，有创意和深度' },
    good: { min: 80, description: '内容较为充实，表达清楚' },
    fair: { min: 70, description: '内容一般，基本表达清楚' },
    poor: { min: 60, description: '内容单薄，表达不够清楚' }
  },
  structure: {
    excellent: { min: 90, description: '结构完整，层次清晰，过渡自然' },
    good: { min: 80, description: '结构较为完整，层次较清楚' },
    fair: { min: 70, description: '结构基本完整，层次一般' },
    poor: { min: 60, description: '结构不够完整，层次不清' }
  },
  language: {
    excellent: { min: 90, description: '语言生动准确，有文采' },
    good: { min: 80, description: '语言较为生动，表达准确' },
    fair: { min: 70, description: '语言基本准确，表达一般' },
    poor: { min: 60, description: '语言表达有待提高' }
  }
};