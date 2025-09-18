'use client';

import React, { useState, useCallback } from 'react';
import { ImageUpload } from './ImageUpload';
import { GradeSelection } from './GradeSelection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileImage, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Info,
  Wifi,
  WifiOff,
  BookOpen
} from 'lucide-react';
import { analyzeEssay, isOnline, waitForOnline, getErrorMessage } from '@/lib/api';
import { renderImageToDataURL } from '@/lib/image';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/components/ui/toast';
import type { UploadedFile, EssayAnalysisResult, GradeLevel } from '@/types';
import { cn } from '@/lib/utils';

interface EssayUploaderProps {
  onAnalysisComplete: (result: EssayAnalysisResult) => void;
  onAnalysisStart?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function EssayUploader({
  onAnalysisComplete,
  onAnalysisStart,
  onError,
  className,
}: EssayUploaderProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [networkStatus, setNetworkStatus] = useState(true); // Default to true to avoid hydration mismatch
  const { addToast } = useToast();
  
  // 使用全局状态管理
  const {
    analysisState,
    setAnalysisState,
    setAnalysisResult,
    setCurrentImageUrl,
    setSelectedGrade,
    selectedGrade,
    setGlobalError,
    updateStats,
    resetState,
  } = useAppStore();

  // 监听网络状态变化
  React.useEffect(() => {
    // Set initial network status on client side
    setNetworkStatus(isOnline());
    
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 处理文件选择
  const handleFileSelect = useCallback((file: File, preview: string) => {
    setUploadedFile({
      file,
      preview,
      base64: '', // 将在分析时生成
    });
    
    setAnalysisState({
      status: 'idle',
      progress: 0,
      message: '文件已选择，点击开始分析',
    });
    
    setGlobalError(null);
    
    // 显示成功提示
    addToast({
      type: 'success',
      title: '文件上传成功',
      description: `已选择文件：${file.name}`,
      duration: 3000,
    });
  }, [setAnalysisState, setGlobalError, addToast]);

  // 处理文件移除
  const handleFileRemove = useCallback(() => {
    setUploadedFile(null);

    // 仅重置与当前上传/分析相关的状态，保留年级选择，便于再次上传
    setAnalysisState({
      status: 'idle',
      progress: 0,
      message: '',
      result: undefined,
      error: undefined,
    });
    setAnalysisResult(null);
    setCurrentImageUrl(null);
    setGlobalError(null);
  }, [setAnalysisState, setAnalysisResult, setCurrentImageUrl, setGlobalError]);

  // 处理年级选择
  const handleGradeSelect = useCallback((grade: GradeLevel) => {
    setSelectedGrade(grade);
    setAnalysisState({
      status: 'idle',
      progress: 0,
      message: `已选择${grade === 'grade-3' ? '三年级' : grade === 'grade-4' ? '四年级' : grade === 'grade-5' ? '五年级' : '六年级'}，请上传作文图片`,
    });
    setGlobalError(null);
    
    // 显示选择提示
    addToast({
      type: 'success',
      title: '年级选择成功',
      description: `已选择${grade === 'grade-3' ? '三年级' : grade === 'grade-4' ? '四年级' : grade === 'grade-5' ? '五年级' : '六年级'}，系统将提供针对性的批改建议`,
      duration: 3000,
    });
  }, [setSelectedGrade, setAnalysisState, setGlobalError, addToast]);

  // 开始分析
  const handleStartAnalysis = useCallback(async () => {
    if (!uploadedFile) return;

    // 检查是否选择了年级
    if (!selectedGrade) {
      setGlobalError('请先选择学生的年级');
      onError?.('请先选择学生的年级');
      return;
    }

    // 检查网络连接
    if (!networkStatus) {
      setGlobalError('网络连接已断开，请检查网络设置');
      onError?.('网络连接已断开，请检查网络设置');
      return;
    }

    try {
      onAnalysisStart?.();
      
      // 第一步：上传文件
      setAnalysisState({
        status: 'uploading',
        progress: 10,
        message: '正在处理图片...',
      });

      const processedDataUrl = await renderImageToDataURL(uploadedFile.file, { maxDimension: 2000, mimeType: 'image/jpeg', quality: 0.9 });

      // 第二步：开始分析
      setAnalysisState({
        status: 'analyzing',
        progress: 30,
        message: '正在识别文字内容...',
      });

      // 模拟分析进度
      const progressSteps = [
        { progress: 50, message: '正在分析文章结构...' },
        { progress: 70, message: '正在评估语言表达...' },
        { progress: 90, message: '正在生成批改建议...' },
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 检查网络状态
        if (!isOnline()) {
          throw new Error('网络连接中断，请检查网络设置');
        }
        
        setAnalysisState({
          progress: step.progress,
          message: step.message,
        });
      }

      // 调用分析API，传入年级信息
      const analysisResult = await analyzeEssay(processedDataUrl, { grade: selectedGrade });

      if (!analysisResult.success) {
        throw new Error(analysisResult.error || '分析失败');
      }

      // 更新统计信息
      if (analysisResult.usage) {
        updateStats(analysisResult.usage);
      }

      // 分析完成
      setAnalysisState({
        status: 'completed',
        progress: 100,
        message: '分析完成！',
        result: analysisResult.data,
      });

      setAnalysisResult(analysisResult.data!);
      setCurrentImageUrl(processedDataUrl);
      onAnalysisComplete(analysisResult.data!);
      
      // 显示成功提示
      addToast({
        type: 'success',
        title: '分析完成',
        description: `总分：${analysisResult.data!.overall_score}/100`,
        duration: 5000,
      });
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      
      setAnalysisState({
        status: 'error',
        progress: 0,
        message: errorMessage,
        error: errorMessage,
      });

      setGlobalError(errorMessage);
      onError?.(errorMessage);
      
      // 显示错误提示
      addToast({
        type: 'error',
        title: '分析失败',
        description: errorMessage,
        duration: 8000,
      });
    }
  }, [
    uploadedFile, 
    networkStatus, 
    selectedGrade,
    onAnalysisStart, 
    onAnalysisComplete, 
    onError,
    setAnalysisState,
    setAnalysisResult,
    setGlobalError,
    updateStats,
    addToast
  ]);

  // 重新开始
  const handleRestart = useCallback(() => {
    setAnalysisState({
      status: 'idle',
      progress: 0,
      message: uploadedFile && selectedGrade ? '点击开始分析' : '',
    });
    setGlobalError(null);
  }, [uploadedFile, selectedGrade, setAnalysisState, setGlobalError]);

  // 重试网络连接
  const handleRetryConnection = useCallback(async () => {
    setAnalysisState({
      status: 'uploading',
      progress: 0,
      message: '正在检查网络连接...',
    });

    const isConnected = await waitForOnline(5000);
    
    if (isConnected) {
      setNetworkStatus(true);
      setGlobalError(null);
      handleRestart();
    } else {
      setAnalysisState({
        status: 'error',
        progress: 0,
        message: '网络连接超时，请检查网络设置',
        error: '网络连接超时',
      });
    }
  }, [setAnalysisState, setGlobalError, handleRestart]);

  const isAnalyzing = analysisState.status === 'uploading' || analysisState.status === 'analyzing';
  const canStartAnalysis = uploadedFile && selectedGrade && analysisState.status === 'idle' && networkStatus;

  return (
    <div className={cn('w-full max-w-2xl mx-auto space-y-6', className)}>
      {/* 网络状态提示 */}
      {!networkStatus && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3'>
              <WifiOff className='h-5 w-5 text-red-600' />
              <div className='flex-1'>
                <p className='text-red-800 font-medium'>网络连接已断开</p>
                <p className='text-red-600 text-sm'>请检查网络设置后重试</p>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={handleRetryConnection}
                className='border-red-300 text-red-700 hover:bg-red-100'
              >
                重试连接
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 年级选择 */}
      <GradeSelection
        selectedGrade={selectedGrade}
        onGradeSelect={handleGradeSelect}
      />

      {/* 上传区域 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileImage className='h-5 w-5' />
            上传作文图片
            {networkStatus ? (
              <Wifi className='h-4 w-4 text-green-600 ml-auto' />
            ) : (
              <WifiOff className='h-4 w-4 text-red-600 ml-auto' />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            disabled={isAnalyzing}
          />
        </CardContent>
      </Card>

      {/* 分析控制区域 */}
      {uploadedFile && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span className='flex items-center gap-2'>
                <Settings className='h-5 w-5' />
                分析设置
              </span>
              <div className='flex items-center gap-2'>
                {selectedGrade && (
                  <Badge variant='secondary' className='text-xs'>
                    <BookOpen className='h-3 w-3 mr-1' />
                    {selectedGrade === 'grade-3' && '三年级'}
                    {selectedGrade === 'grade-4' && '四年级'}
                    {selectedGrade === 'grade-5' && '五年级'}
                    {selectedGrade === 'grade-6' && '六年级'}
                  </Badge>
                )}
                <Badge variant='outline'>
                  {analysisState.status === 'idle' && '准备就绪'}
                  {analysisState.status === 'uploading' && '上传中'}
                  {analysisState.status === 'analyzing' && '分析中'}
                  {analysisState.status === 'completed' && '已完成'}
                  {analysisState.status === 'error' && '出错'}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* 进度显示 */}
            {isAnalyzing && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>
                    {analysisState.message}
                  </span>
                  <span className='font-medium'>
                    {analysisState.progress}%
                  </span>
                </div>
                <Progress value={analysisState.progress} className='h-2' />
              </div>
            )}

            {/* 状态消息 */}
            {analysisState.message && !isAnalyzing && (
              <div className={cn(
                'flex items-center gap-2 p-3 rounded-md text-sm',
                analysisState.status === 'completed' && 'bg-green-50 text-green-700 border border-green-200',
                analysisState.status === 'error' && 'bg-red-50 text-red-700 border border-red-200',
                analysisState.status === 'idle' && 'bg-blue-50 text-blue-700 border border-blue-200'
              )}>
                {analysisState.status === 'completed' && <CheckCircle className='h-4 w-4' />}
                {analysisState.status === 'error' && <AlertCircle className='h-4 w-4' />}
                {analysisState.status === 'idle' && <Info className='h-4 w-4' />}
                <span>{analysisState.message}</span>
              </div>
            )}

            {/* 操作按钮 */}
            <div className='flex gap-2'>
              {canStartAnalysis && (
                <Button 
                  onClick={handleStartAnalysis}
                  className='flex-1'
                >
                  <FileImage className='h-4 w-4 mr-2' />
                  开始{selectedGrade === 'grade-3' && '三年级'}
                  {selectedGrade === 'grade-4' && '四年级'}
                  {selectedGrade === 'grade-5' && '五年级'}
                  {selectedGrade === 'grade-6' && '六年级'}
                  智能批改
                </Button>
              )}

              {isAnalyzing && (
                <Button disabled className='flex-1'>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  分析中...
                </Button>
              )}

              {(analysisState.status === 'completed' || analysisState.status === 'error') && (
                <Button 
                  variant='outline'
                  onClick={handleRestart}
                  className='flex-1'
                  disabled={!networkStatus}
                >
                  重新分析
                </Button>
              )}
            </div>

            {/* 提示信息 */}
            <div className='text-xs text-muted-foreground space-y-1'>
              <p>💡 提示：请确保作文图片清晰，字迹工整，以获得最佳分析效果</p>
              <p>🔒 隐私保护：您的作文图片仅用于本次分析，不会被保存或用于其他用途</p>
              <p>⚡ 智能重试：系统会自动处理网络异常和临时错误</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
