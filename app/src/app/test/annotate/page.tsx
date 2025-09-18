'use client';

import React from 'react';
import { AnnotatedImageDisplay } from '@/components/AnnotatedImageDisplay';
import type { EssayAnnotation } from '@/types';

const svgDataUrl =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='600'><rect width='100%' height='100%' fill='white'/></svg>"
  );

const annotations: EssayAnnotation[] = [
  {
    id: 'a1',
    type: 'improvement',
    text: '测试横线',
    coordinates: [0.1, 0.5, 0.9, 0.5],
    improved_text: '建议文本',
    reason: '用于验证双横线位置对齐',
  },
  {
    id: 'b1',
    type: 'praise',
    text: '测试波浪线',
    coordinates: [0.1, 0.7, 0.9, 0.7],
    reason: '用于验证波浪线位置对齐',
  },
];

export default function AnnotateTestPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">标注绘制对齐测试页</h1>
        <p className="text-sm text-slate-600 mb-4">
          该页面使用固定尺寸的 SVG 图片（1000x600），用于验证标注绘制是否与图片内容区域严格对齐。
        </p>
        <div className="w-[1000px]">
          <AnnotatedImageDisplay imageUrl={svgDataUrl} annotations={annotations} overallScore={88} />
        </div>
      </div>
    </div>
  );
}
