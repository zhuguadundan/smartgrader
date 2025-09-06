'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, FileImage, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { validateFile, formatFileSize } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onFileSelect: (file: File, preview: string) => void;
  onFileRemove: () => void;
  disabled?: boolean;
  className?: string;
}

interface UploadState {
  isDragOver: boolean;
  file: File | null;
  preview: string | null;
  error: string | null;
  isValidating: boolean;
}

export function ImageUpload({
  onFileSelect,
  onFileRemove,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [state, setState] = useState<UploadState>({
    isDragOver: false,
    file: null,
    preview: null,
    error: null,
    isValidating: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = useCallback(
    async (file: File) => {
      setState(prev => ({ ...prev, isValidating: true, error: null }));

      // 验证文件
      const validation = validateFile(file);
      if (!validation.valid) {
        setState(prev => ({
          ...prev,
          error: validation.error || '文件验证失败',
          isValidating: false,
        }));
        return;
      }

      try {
        // 创建预览URL
        const preview = URL.createObjectURL(file);
        
        setState(prev => ({
          ...prev,
          file,
          preview,
          error: null,
          isValidating: false,
        }));

        onFileSelect(file, preview);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: '文件处理失败，请重试',
          isValidating: false,
        }));
      }
    },
    [onFileSelect]
  );

  // 处理文件移除
  const handleFileRemove = useCallback(() => {
    if (state.preview) {
      URL.revokeObjectURL(state.preview);
    }
    
    setState({
      isDragOver: false,
      file: null,
      preview: null,
      error: null,
      isValidating: false,
    });

    onFileRemove();
  }, [state.preview, onFileRemove]);

  // 拖拽事件处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setState(prev => ({ ...prev, isDragOver: true }));
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragOver: false }));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState(prev => ({ ...prev, isDragOver: false }));

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [disabled, handleFileSelect]
  );

  // 点击上传
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // 文件输入变化
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/jpeg,image/png,image/jpg'
        onChange={handleInputChange}
        className='hidden'
        disabled={disabled}
      />

      {!state.file ? (
        // 上传区域
        <Card
          className={cn(
            'border-2 border-dashed transition-all duration-200 cursor-pointer',
            state.isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed',
            state.error && 'border-destructive bg-destructive/5'
          )}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className='flex flex-col items-center justify-center p-8 text-center'>
            {state.isValidating ? (
              <>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4' />
                <p className='text-sm text-muted-foreground'>验证文件中...</p>
              </>
            ) : (
              <>
                <div className='mb-4'>
                  {state.error ? (
                    <AlertCircle className='h-12 w-12 text-destructive' />
                  ) : (
                    <Upload
                      className={cn(
                        'h-12 w-12 transition-colors',
                        state.isDragOver ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                  )}
                </div>

                <div className='space-y-2'>
                  <p className='text-lg font-medium'>
                    {state.isDragOver
                      ? '松开鼠标上传文件'
                      : '拖拽图片到这里，或点击上传'}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    支持 JPG、PNG 格式，文件大小不超过 10MB
                  </p>
                </div>

                {state.error && (
                  <div className='mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md'>
                    <p className='text-sm text-destructive font-medium'>
                      {state.error}
                    </p>
                  </div>
                )}

                <Button
                  variant='outline'
                  className='mt-4'
                  disabled={disabled}
                  onClick={e => {
                    e.stopPropagation();
                    handleClick();
                  }}
                >
                  <FileImage className='h-4 w-4 mr-2' />
                  选择文件
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        // 预览区域
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-start gap-4'>
              {/* 图片预览 */}
              <div className='relative flex-shrink-0'>
                <img
                  src={state.preview!}
                  alt='预览'
                  className='w-24 h-24 object-cover rounded-lg border'
                />
                <Button
                  variant='destructive'
                  size='sm'
                  className='absolute -top-2 -right-2 h-6 w-6 rounded-full p-0'
                  onClick={handleFileRemove}
                  disabled={disabled}
                >
                  <X className='h-3 w-3' />
                </Button>
              </div>

              {/* 文件信息 */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-2'>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                  <span className='text-sm font-medium text-green-700'>
                    文件上传成功
                  </span>
                </div>

                <p className='text-sm font-medium truncate mb-1'>
                  {state.file.name}
                </p>

                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <span>{formatFileSize(state.file.size)}</span>
                  <span>•</span>
                  <Badge variant='secondary' className='text-xs'>
                    {state.file.type.split('/')[1].toUpperCase()}
                  </Badge>
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  className='mt-2'
                  onClick={handleClick}
                  disabled={disabled}
                >
                  <Upload className='h-3 w-3 mr-1' />
                  重新上传
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}