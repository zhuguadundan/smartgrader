'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import type { EssayAnnotation } from '@/types';
import { cn } from '@/lib/utils';

interface AnnotatedImageDisplayProps {
  imageUrl: string;
  annotations: EssayAnnotation[];
  className?: string;
  overallScore?: number;
}

export function AnnotatedImageDisplay({ 
  imageUrl, 
  annotations, 
  className,
  overallScore
}: AnnotatedImageDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);

  // 处理图片加载完成
  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setImageDimensions({ width: naturalWidth, height: naturalHeight });
      setImageLoaded(true);
      // 初次加载后尽快安排绘制，降低首帧检测失败概率
      requestAnimationFrame(() => requestAnimationFrame(() => drawAnnotations()));
    }
  };

  // 绘制标注
  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image || !imageLoaded || !showAnnotations) {
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true } as CanvasRenderingContext2DSettings);
    if (!ctx) return;

    // 设置画布尺寸与图片显示尺寸一致（考虑设备像素比，避免模糊/错位）
    const rect = image.getBoundingClientRect();
    const dpr = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;

    // 画布 CSS 使用 absolute inset-0 填充容器，这里仅设置实际像素尺寸
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    // 同步 CSS 尺寸，保证与测量来源一致（避免容器细微差异导致错位）
    canvas.style.width = `${Math.max(1, Math.round(displayWidth))}px`;
    canvas.style.height = `${Math.max(1, Math.round(displayHeight))}px`;
    // 设置绘图缓冲区尺寸（按 DPR 提升清晰度）
    canvas.width = Math.max(1, Math.round(displayWidth * dpr));
    canvas.height = Math.max(1, Math.round(displayHeight * dpr));

    // 重置并按 dpr 缩放，使后续坐标基于 CSS 像素绘制
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // 清空画布
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // 绘制分数标注（在右上角）
    if (overallScore !== undefined) {
      const scoreText = `${overallScore}分`;
      const fontSize = 28;
      const padding = 8;
      
      ctx.font = `bold ${fontSize}px Arial`;
      // 右上角对齐：使用 right 对齐，x 取显示宽度减去 padding；
      // 文本基线使用 top，y 直接取 padding，避免多加一个字体高度导致的下移
      const scoreX = displayWidth - padding;
      const scoreY = padding;
      
      // 绘制红色分数文字
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      
      // 添加文字描边效果，使其更清晰
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeText(scoreText, scoreX, scoreY);
      ctx.fillText(scoreText, scoreX, scoreY);
    }

    // 对改进类型的标注进行重新编号
    const improvementAnnotations = annotations.filter(a => a.type === 'improvement');
    const annotationIdMap = new Map<string, string>();
    
    improvementAnnotations.forEach((annotation, index) => {
      annotationIdMap.set(annotation.id, String(index + 1));
    });

    // 绘制每个标注
    annotations.forEach((annotation) => {
      // 检查coordinates是否存在且是有效的数组
      if (!annotation.coordinates || !Array.isArray(annotation.coordinates) || annotation.coordinates.length !== 4) {
        return; // 跳过无效的标注
      }
      let [x1, y1, x2, y2] = annotation.coordinates;
      // 兜底：确保坐标在 [0,1] 且 x1<=x2, y1<=y2
      x1 = Math.max(0, Math.min(1, x1));
      y1 = Math.max(0, Math.min(1, y1));
      x2 = Math.max(0, Math.min(1, x2));
      y2 = Math.max(0, Math.min(1, y2));
      if (x1 > x2) [x1, x2] = [x2, x1];
      if (y1 > y2) [y1, y2] = [y2, y1];
      
      // 转换归一化坐标到画布（CSS 像素）坐标
      const pxX1 = x1 * displayWidth;
      const pxY1 = y1 * displayHeight;
      const pxX2 = x2 * displayWidth;
      const pxY2 = y2 * displayHeight;
      
      // 划线位置贴近文字底部（使用 y2 往上按比例微调，适配不同字号与缩放）
      const boxH = Math.max(1, pxY2 - pxY1);
      const underlineOffset = annotation.type === 'praise'
        ? Math.min(6, Math.max(2, boxH * 0.12))
        // 需要改进：与测试页对齐，固定 5px 偏移
        : 5;
      const baseY = Math.max(0, Math.min(displayHeight, pxY2 - underlineOffset));

      ctx.lineWidth = 3;
      ctx.strokeStyle = annotation.type === 'praise' ? '#22c55e' : '#dc2626';
      ctx.fillStyle = annotation.type === 'praise' ? '#22c55e' : '#dc2626';

      if (annotation.type === 'praise') {
        // 绘制波浪线（好词好句）
        ctx.beginPath();
        const waveHeight = 4;
        const steps = Math.max(10, Math.ceil((pxX2 - pxX1) / 3));
        
        for (let i = 0; i <= steps; i++) {
          const x = pxX1 + (pxX2 - pxX1) * (i / steps);
          const y = baseY + Math.sin((i / steps) * Math.PI * 4) * waveHeight;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      } else {
        // 绘制横线（需要改进的句子）- 使用填充矩形，避免亚像素取样导致检测失败
        const thickness = 2; // 2px 厚度
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(pxX1, Math.round(baseY), pxX2 - pxX1, thickness);
        ctx.fillRect(pxX1, Math.round(baseY + 5), pxX2 - pxX1, thickness);

        // 绘制编号 - 放在线条右侧，使用红色，使用重新编号后的ID
        const displayId = annotationIdMap.get(annotation.id) || annotation.id;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#dc2626';
        ctx.fillText(
          displayId, 
          pxX2 + 8, 
          baseY + 2
        );
      }

      // 如果悬停在这个标注上，高亮显示
      if (hoveredAnnotation === annotation.id) {
        ctx.fillStyle = annotation.type === 'praise' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(220, 38, 38, 0.2)';
        ctx.fillRect(pxX1, pxY1 - 8, pxX2 - pxX1, pxY2 - pxY1 + 16);
      }
    });
  };

  // 监听窗口大小变化和图片加载
  useEffect(() => {
    const handleResize = () => {
      // 使用两帧确保布局完全稳定后再绘制
      requestAnimationFrame(() => requestAnimationFrame(() => drawAnnotations()));
    };

    const resizeObserver = new ResizeObserver(handleResize);

    if (imageRef.current) {
      resizeObserver.observe(imageRef.current);
    }

    window.addEventListener('resize', handleResize);
    
    if (imageLoaded) {
      // 初次加载后也采用双 rAF，降低布局抖动带来的错位几率
      requestAnimationFrame(() => requestAnimationFrame(() => drawAnnotations()));
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [imageLoaded, showAnnotations, annotations, hoveredAnnotation]);

  // 兜底：若图片在 React 绑定 onLoad 前已完成加载，使用 complete 标志触发一次初始化
  useEffect(() => {
    const img = imageRef.current;
    if (img && img.complete && !imageLoaded) {
      handleImageLoad();
    }
  }, [imageUrl, imageLoaded]);

  // 处理鼠标移动事件
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !showAnnotations) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // 检查鼠标是否在某个标注区域内
    const hovered = annotations.find(annotation => {
      if (!annotation.coordinates || !Array.isArray(annotation.coordinates) || annotation.coordinates.length !== 4) {
        return false; // 跳过无效的标注
      }
      const [x1, y1, x2, y2] = annotation.coordinates;
      // 扩大检测区域，使其更容易悬停
      const expandedY1 = Math.max(0, y1 - 0.01);
      const expandedY2 = Math.min(1, y2 + 0.01);
      return x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && y >= Math.min(expandedY1, expandedY2) && y <= Math.max(expandedY1, expandedY2);
    });

    setHoveredAnnotation(hovered?.id || null);
  };

  return (
    <div className={cn('relative', className)}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">作文批改标注</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-0.5 bg-green-500"></div>
                  <span>好词好句</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-0.5 bg-red-500"></div>
                  <span>需改进</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnnotations(!showAnnotations)}
              >
                {showAnnotations ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    隐藏标注
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    显示标注
                  </>
                )}
              </Button>
            </div>
          </div>

          <div 
            className="relative inline-block rounded-lg border overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredAnnotation(null)}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="作文图片"
              className="block max-w-full h-auto"
              onLoad={handleImageLoad}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 pointer-events-none"
              style={{ 
                display: showAnnotations ? 'block' : 'none'
              }}
            />
          </div>

          {/* 标注说明 */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">好词好句</h4>
              <div className="space-y-2">
                {annotations
                  .filter(a => a.type === 'praise')
                  .map(annotation => (
                    <div 
                      key={annotation.id}
                      className={cn(
                        "p-2 rounded border-l-4 border-green-500 bg-green-50",
                        hoveredAnnotation === annotation.id && "bg-green-100"
                      )}
                      onMouseEnter={() => setHoveredAnnotation(annotation.id)}
                      onMouseLeave={() => setHoveredAnnotation(null)}
                    >
                      <div className="text-sm font-medium text-green-800">
                        {annotation.text}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {annotation.reason}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-red-700 mb-2">改进建议</h4>
              <div className="space-y-2">
                {annotations
                  .filter(a => a.type === 'improvement')
                  .map((annotation, idx) => (
                    <div 
                      key={annotation.id}
                      className={cn(
                        "p-2 rounded border-l-4 border-red-500 bg-red-50",
                        hoveredAnnotation === annotation.id && "bg-red-100"
                      )}
                      onMouseEnter={() => setHoveredAnnotation(annotation.id)}
                      onMouseLeave={() => setHoveredAnnotation(null)}
                    >
                      <div className="flex items-start gap-2">
                        <Badge variant="destructive" className="text-xs">
                          {idx + 1}
                        </Badge>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-red-800">
                            原文：{annotation.text}
                          </div>
                          {annotation.improved_text && (
                            <div className="text-sm text-blue-700 mt-1">
                              建议：{annotation.improved_text}
                            </div>
                          )}
                          <div className="text-xs text-red-600 mt-1">
                            {annotation.reason}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
