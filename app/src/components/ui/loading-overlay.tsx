'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  className?: string;
}

export function LoadingOverlay({
  isVisible,
  message = '加载中...',
  progress,
  className,
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-background/80 backdrop-blur-sm',
        'animate-in fade-in-0 duration-200',
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4 p-8 bg-card rounded-lg shadow-lg border">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          {progress !== undefined && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">{message}</p>
          {progress !== undefined && (
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}