'use client';

import { useState, useEffect } from 'react';
import { EssayUploader } from '@/components/EssayUploader';
import { EssayResultDisplay } from '@/components/EssayResultDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { EssayAnalysisResult } from '@/types';

export default function UploadTestPage() {
  const [analysisResult, setAnalysisResult] = useState<EssayAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  
  const { currentImageUrl: globalImageUrl } = useAppStore();

  // 监听全局图片URL变化
  useEffect(() => {
    if (globalImageUrl) {
      setCurrentImageUrl(globalImageUrl);
    }
  }, [globalImageUrl]);

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setShowResult(false);
    setCurrentImageUrl(null);
  };

  const handleAnalysisComplete = (result: EssayAnalysisResult) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
    setShowResult(true);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsAnalyzing(false);
    setShowResult(false);
  };

  const handleBackToUpload = () => {
    setShowResult(false);
  };

  if (showResult && analysisResult) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8'>
          <div className='mx-auto max-w-4xl'>
            {/* 返回按钮 */}
            <div className='mb-6'>
              <Button
                variant='outline'
                onClick={handleBackToUpload}
                className='flex items-center gap-2'
              >
                <ArrowLeft className='h-4 w-4' />
                返回上传
              </Button>
            </div>

            {/* 页面标题 */}
            <div className='text-center mb-8'>
              <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-4'>
                📝 作文批改报告
              </h1>
              <p className='text-lg text-gray-600'>
                AI智能分析结果，助力写作提升
              </p>
            </div>

            {/* 结果展示 */}
            <EssayResultDisplay result={analysisResult} imageUrl={currentImageUrl || undefined} />
          </div>
        </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8'>
        <div className='mx-auto max-w-6xl'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-4'>
              智能作文批改助手
            </h1>
            <p className='text-lg text-gray-600'>
              上传作文图片，获得专业的AI批改建议
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* 左侧：上传区域 */}
            <div>
              <EssayUploader
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
              />
            </div>

            {/* 右侧：状态展示 */}
            <div className='space-y-6'>
              {/* 状态卡片 */}
              <Card>
                <CardHeader>
                  <CardTitle>分析状态</CardTitle>
                </CardHeader>
                <CardContent>
                  {!isAnalyzing && !error && !analysisResult && (
                    <div className='text-center py-8'>
                      <div className='text-6xl mb-4'>🤖</div>
                      <p className='text-muted-foreground'>
                        请上传作文图片开始分析
                      </p>
                    </div>
                  )}
                  
                  {isAnalyzing && (
                    <div className='text-center py-8'>
                      <div className='animate-spin text-6xl mb-4'>⚙️</div>
                      <p className='text-blue-600 font-medium'>
                        AI正在分析您的作文...
                      </p>
                    </div>
                  )}
                  
                  {error && (
                    <div className='text-center py-8'>
                      <div className='text-6xl mb-4'>❌</div>
                      <p className='text-red-600 font-medium'>
                        {error}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 功能介绍 */}
              <Card>
                <CardHeader>
                  <CardTitle>功能特点</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <span className='text-2xl'>🎯</span>
                    <div>
                      <h4 className='font-medium'>智能识别</h4>
                      <p className='text-sm text-muted-foreground'>
                        精准识别手写作文内容
                      </p>
                    </div>
                  </div>
                  
                  <div className='flex items-center gap-3'>
                    <span className='text-2xl'>📝</span>
                    <div>
                      <h4 className='font-medium'>多维分析</h4>
                      <p className='text-sm text-muted-foreground'>
                        全面评估作文质量
                      </p>
                    </div>
                  </div>
                  
                  <div className='flex items-center gap-3'>
                    <span className='text-2xl'>💡</span>
                    <div>
                      <h4 className='font-medium'>直观标注</h4>
                      <p className='text-sm text-muted-foreground'>
                        在图片上直接标注好词好句和改进建议
                      </p>
                    </div>
                  </div>
                  
                  <div className='flex items-center gap-3'>
                    <span className='text-2xl'>🔒</span>
                    <div>
                      <h4 className='font-medium'>隐私保护</h4>
                      <p className='text-sm text-muted-foreground'>
                        图片仅用于分析，不会保存
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );
}