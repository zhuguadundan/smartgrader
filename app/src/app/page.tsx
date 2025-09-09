'use client';

import React, { useState } from 'react';
import { EssayUploader } from '@/components/EssayUploader';
import { EssayResultDisplay } from '@/components/EssayResultDisplay';
import { ToastProvider } from '@/components/ui/toast';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import type { EssayAnalysisResult } from '@/types';
import { Sparkles, BookOpen, Target, TrendingUp, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<EssayAnalysisResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const { analysisState, isLoading, loadingMessage, stats, currentImageUrl } = useAppStore();

  const handleAnalysisComplete = (result: EssayAnalysisResult) => {
    setAnalysisResult(result);
    setShowResult(true);
  };

  const handleAnalysisStart = () => {
    setShowResult(false);
    setAnalysisResult(null);
  };

  const handleNewAnalysis = () => {
    setShowResult(false);
    setAnalysisResult(null);
  };

  return (
    <ToastProvider>
      <main className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
        <LoadingOverlay
          isVisible={isLoading}
          message={loadingMessage}
          progress={analysisState.progress}
        />
        
        <div className='container mx-auto px-4 py-8'>
          {/* 头部区域 */}
          <div className='text-center mb-12'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex-1'></div>
              <div className='flex items-center justify-center gap-3'>
                <div className='p-3 bg-primary/10 rounded-full'>
                  <Sparkles className='h-8 w-8 text-primary' />
                </div>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                  智能作文批改助手
                </h1>
              </div>
              <div className='flex-1 flex justify-end'>
                {stats.totalAnalyses > 0 && (
                  <Link href='/stats'>
                    <Button variant='outline' size='sm'>
                      <BarChart3 className='h-4 w-4 mr-2' />
                      使用统计
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              基于智谱GLM-4.5V多模态AI技术，为小学生提供专业、即时的作文批改服务
            </p>
            
            {/* 统计信息 */}
            {stats.totalAnalyses > 0 && (
              <div className='flex items-center justify-center gap-6 mt-6'>
                <div className='flex items-center gap-2'>
                  <BookOpen className='h-4 w-4 text-blue-600' />
                  <span className='text-sm text-muted-foreground'>
                    已批改 <Badge variant='secondary'>{stats.totalAnalyses}</Badge> 篇作文
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Target className='h-4 w-4 text-green-600' />
                  <span className='text-sm text-muted-foreground'>
                    使用 <Badge variant='secondary'>{stats.totalTokensUsed}</Badge> tokens
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4 text-purple-600' />
                  <span className='text-sm text-muted-foreground'>
                    成本 <Badge variant='secondary'>¥{stats.totalCost.toFixed(4)}</Badge>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 主要内容区域 */}
          <div className='max-w-4xl mx-auto'>
            {!showResult ? (
              /* 上传和分析区域 */
              <div className='space-y-8'>
                <EssayUploader
                  onAnalysisComplete={handleAnalysisComplete}
                  onAnalysisStart={handleAnalysisStart}
                />
                
                {/* 功能介绍 */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <Card className='border-blue-200 bg-blue-50/50'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        📝 智能识别
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm text-muted-foreground'>
                        支持手写作文图片上传，AI自动识别文字内容，准确率高达95%以上
                      </p>
                    </CardContent>
                  </Card>

                  <Card className='border-green-200 bg-green-50/50'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        🤖 多维评价
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm text-muted-foreground'>
                        从书写、内容、结构、语言四个维度进行专业评价，全面提升写作水平
                      </p>
                    </CardContent>
                  </Card>

                  <Card className='border-purple-200 bg-purple-50/50'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        📝 智能标注
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm text-muted-foreground'>
                        在原作文图片上直接标注好词好句和改进建议，提供更直观的批改体验
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              /* 结果展示区域 */
              <EssayResultDisplay
                result={analysisResult!}
                onNewAnalysis={handleNewAnalysis}
                imageUrl={currentImageUrl || undefined}
              />
            )}
          </div>

          {/* 页脚信息 */}
          <div className='text-center mt-16 pt-8 border-t border-muted'>
            <p className='text-sm text-muted-foreground'>
              Powered by 智谱GLM-4.5V • 专为小学生作文批改设计 • 安全可靠的AI助手
            </p>
          </div>
        </div>
      </main>
    </ToastProvider>
  );
}