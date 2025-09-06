'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EssayAnalysisResult } from '@/types';

interface RadarChartComponentProps {
  data: EssayAnalysisResult;
  className?: string;
}

// 维度名称映射
const DIMENSION_LABELS = {
  handwriting: '字迹工整',
  content: '内容丰富',
  structure: '结构清晰',
  language: '语言表达',
};

// 颜色配置
const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#e2e8f0',
  grid: '#f1f5f9',
};

export function RadarChartComponent({ data, className }: RadarChartComponentProps) {
  // 转换数据格式
  const chartData = Object.entries(data.dimensions).map(([key, dimension]) => ({
    dimension: DIMENSION_LABELS[key as keyof typeof DIMENSION_LABELS],
    score: dimension.score,
    fullMark: 100,
  }));

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      return (
        <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-medium text-gray-900'>{label}</p>
          <p className='text-blue-600'>
            得分: <span className='font-semibold'>{score}</span>/100
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='text-center'>各维度评分雷达图</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='h-80 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid 
                stroke={CHART_COLORS.grid}
                strokeWidth={1}
              />
              <PolarAngleAxis 
                dataKey='dimension'
                tick={{ 
                  fontSize: 12, 
                  fill: '#64748b',
                  fontWeight: 500
                }}
                className='text-sm'
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ 
                  fontSize: 10, 
                  fill: '#94a3b8' 
                }}
                tickCount={6}
              />
              <Radar
                name='得分'
                dataKey='score'
                stroke={CHART_COLORS.primary}
                fill={CHART_COLORS.primary}
                fillOpacity={0.1}
                strokeWidth={2}
                dot={{ 
                  fill: CHART_COLORS.primary, 
                  strokeWidth: 2, 
                  r: 4 
                }}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 图例说明 */}
        <div className='mt-4 grid grid-cols-2 gap-3 text-sm'>
          {Object.entries(data.dimensions).map(([key, dimension]) => (
            <div key={key} className='flex items-center justify-between p-2 bg-gray-50 rounded'>
              <span className='text-gray-700'>
                {DIMENSION_LABELS[key as keyof typeof DIMENSION_LABELS]}
              </span>
              <span className='font-semibold text-blue-600'>
                {dimension.score}分
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}