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

import { useEffect, useState } from 'react';

export default function AnnotateTestPage() {
  const [checkResult, setCheckResult] = useState<string>('待检测');

  useEffect(() => {
    const check = () => {
      const canvas = document.querySelector('canvas');
      const img = document.querySelector('img');
      if (!canvas || !img) return setCheckResult('未找到画布或图片');

      const rect = (img as HTMLImageElement).getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const ctx = (canvas as HTMLCanvasElement).getContext('2d');
      if (!ctx) return setCheckResult('画布上下文获取失败');

      // 取改进横线中点处像素（应为红色）
      const x1 = 0.1 * rect.width;
      const x2 = 0.9 * rect.width;
      const y2 = 0.5 * rect.height;
      const baseY = Math.max(0, Math.min(rect.height, y2 - 5));
      const midX = (x1 + x2) / 2;

      const sampleX = Math.round(midX * dpr);
      const sampleY = Math.round(baseY * dpr);
      try {
        const data = ctx.getImageData(sampleX, sampleY, 1, 1).data;
        const [r, g, b, a] = data;
        const isRed = r > 180 && g < 90 && b < 90 && a > 0;

        // 再取不应有描边的空白区域（对于覆盖层画布应为透明）
        const whiteY = Math.round(0.45 * rect.height * dpr);
        const white = ctx.getImageData(sampleX, whiteY, 1, 1).data;
        // 透明判定：alpha 为 0 即表示覆盖层无像素（底层是图片）
        const isTransparent = white[3] === 0;

        setCheckResult(isRed && isTransparent ? '通过' : `失败(r:${r},g:${g},b:${b},a:${a})`);
      } catch (e) {
        setCheckResult('采样失败');
      }
    };

    const timer = setTimeout(check, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">标注绘制对齐测试页</h1>
        <p className="text-sm text-slate-600 mb-2">
          该页面使用固定尺寸的 SVG 图片（1000x600），用于验证标注绘制是否与图片内容区域严格对齐。
        </p>
        <p className="text-sm mb-4">自动校验结果：
          <span className={checkResult === '通过' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {checkResult}
          </span>
        </p>
        <div className="w-[1000px]">
          <AnnotatedImageDisplay imageUrl={svgDataUrl} annotations={annotations} overallScore={88} />
        </div>
      </div>
    </div>
  );
}
