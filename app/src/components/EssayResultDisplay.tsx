'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnnotatedImageDisplay } from './AnnotatedImageDisplay';
import { 
  Trophy, 
  Lightbulb, 
  Target, 
  Copy, 
  Check,
  Star,
  TrendingUp,
  MessageSquare,
  Download,
  Share2,
  RotateCcw
} from 'lucide-react';
import type { EssayAnalysisResult } from '@/types';
import { cn } from '@/lib/utils';

interface EssayResultDisplayProps {
  result: EssayAnalysisResult;
  onNewAnalysis?: () => void;
  className?: string;
  imageUrl?: string;
}

// 获取分数等级和颜色
function getScoreLevel(score: number): { level: string; color: string; bgColor: string } {
  if (score >= 90) return { level: '优秀', color: 'text-green-700', bgColor: 'bg-green-100' };
  if (score >= 80) return { level: '良好', color: 'text-blue-700', bgColor: 'bg-blue-100' };
  if (score >= 70) return { level: '中等', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
  return { level: '待提高', color: 'text-red-700', bgColor: 'bg-red-100' };
}

export function EssayResultDisplay({ result, onNewAnalysis, className, imageUrl }: EssayResultDisplayProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const overallLevel = getScoreLevel(result.overall_score);

  // 复制文本到剪贴板
  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 生成完整的评语文本
  const generateFullComment = () => {
    const annotations = result.annotations && result.annotations.length > 0
      ? `\n\n📝 详细标注：\n${result.annotations.map(a => {
          if (a.type === 'praise') {
            return `✨ ${a.text}（${a.reason}）`;
          } else {
            return `💡 ${a.id}. ${a.text} → 建议：${a.improved_text || '待补充'}（${a.reason}）`;
          }
        }).join('\n')}`
      : '';

    const highlights = result.highlights.length > 0 
      ? `\n\n🌟 亮点：\n${result.highlights.map(h => `• ${h}`).join('\n')}`
      : '';

    const suggestions = result.suggestions.length > 0
      ? `\n\n💡 改进建议：\n${result.suggestions.map(s => `• ${s}`).join('\n')}`
      : '';

    return `📝 作文批改报告

总分：${result.overall_score}/100 (${overallLevel.level})

${result.overall_comment}

${annotations}${highlights}${suggestions}

---
本报告由智能作文批改助手生成`;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* 总分卡片 */}
      <Card className='text-center'>
        <CardContent className='pt-6'>
          <div className='space-y-4'>
            <div className='flex items-center justify-center gap-2'>
              <Trophy className='h-8 w-8 text-yellow-500' />
              <span className='text-2xl font-bold text-gray-900'>总体评分</span>
            </div>
            
            <div className='space-y-2'>
              <div className='text-6xl font-bold text-primary'>
                {result.overall_score}
              </div>
              <div className='text-lg text-muted-foreground'>/ 100分</div>
              <Badge 
                className={cn('text-sm px-3 py-1', overallLevel.bgColor, overallLevel.color)}
                variant='secondary'
              >
                {overallLevel.level}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 图片标注显示 */}
      {imageUrl && (
        <AnnotatedImageDisplay 
          imageUrl={imageUrl}
          annotations={result.annotations || []}
          overallScore={result.overall_score}
        />
      )}

      {/* 总体评价 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MessageSquare className='h-5 w-5' />
            总体评价
            <Button
              variant='ghost'
              size='sm'
              onClick={() => copyToClipboard(result.overall_comment, 'overall')}
              className='ml-auto'
            >
              {copiedSection === 'overall' ? (
                <Check className='h-4 w-4 text-green-600' />
              ) : (
                <Copy className='h-4 w-4' />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-gray-700 leading-relaxed text-base'>
            {result.overall_comment}
          </p>
        </CardContent>
      </Card>

      {/* 亮点展示 */}
      {result.highlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Star className='h-5 w-5 text-yellow-500' />
              作文亮点
              <Button
                variant='ghost'
                size='sm'
                onClick={() => copyToClipboard(result.highlights.join('\n'), 'highlights')}
                className='ml-auto'
              >
                {copiedSection === 'highlights' ? (
                  <Check className='h-4 w-4 text-green-600' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-2'>
              {result.highlights.map((highlight, index) => (
                <li key={index} className='flex items-start gap-2'>
                  <span className='text-yellow-500 mt-1'>✨</span>
                  <span className='text-gray-700'>{highlight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 改进建议 */}
      {result.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5 text-blue-500' />
              改进建议
              <Button
                variant='ghost'
                size='sm'
                onClick={() => copyToClipboard(result.suggestions.join('\n'), 'suggestions')}
                className='ml-auto'
              >
                {copiedSection === 'suggestions' ? (
                  <Check className='h-4 w-4 text-green-600' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-3'>
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className='flex items-start gap-2'>
                  <span className='text-blue-500 mt-1'>💡</span>
                  <span className='text-gray-700'>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-wrap gap-3'>
            <Button
              onClick={() => copyToClipboard(generateFullComment(), 'full')}
              className='flex-1 sm:flex-none'
            >
              {copiedSection === 'full' ? (
                <>
                  <Check className='h-4 w-4 mr-2' />
                  已复制
                </>
              ) : (
                <>
                  <Copy className='h-4 w-4 mr-2' />
                  复制完整评语
                </>
              )}
            </Button>
            
            <Button variant='outline' className='flex-1 sm:flex-none'>
              <Share2 className='h-4 w-4 mr-2' />
              分享结果
            </Button>
            
            <Button variant='outline' className='flex-1 sm:flex-none'>
              <Download className='h-4 w-4 mr-2' />
              导出报告
            </Button>

            {onNewAnalysis && (
              <Button 
                variant='outline' 
                onClick={onNewAnalysis}
                className='flex-1 sm:flex-none border-primary text-primary hover:bg-primary hover:text-primary-foreground'
              >
                <RotateCcw className='h-4 w-4 mr-2' />
                新建分析
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 提示信息 */}
      <Card className='bg-blue-50 border-blue-200'>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-3'>
            <Lightbulb className='h-5 w-5 text-blue-600 mt-0.5' />
            <div className='space-y-2'>
              <h4 className='font-medium text-blue-900'>使用建议</h4>
              <ul className='text-sm text-blue-800 space-y-1'>
                <li>• 可以将评语复制后与孩子一起讨论</li>
                <li>• 重点关注改进建议，制定具体的提升计划</li>
                <li>• 鼓励孩子发扬亮点，增强写作信心</li>
                <li>• 建议定期使用本工具跟踪写作进步</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}