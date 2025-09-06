'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { 
  BarChart3, 
  DollarSign, 
  FileText, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

function StatsCard({ title, value, description, icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <p className='text-sm font-medium text-muted-foreground'>{title}</p>
            <div className='flex items-baseline gap-2'>
              <p className='text-2xl font-bold'>{value}</p>
              {trend && (
                <Badge 
                  variant={trend.isPositive ? 'default' : 'secondary'}
                  className={cn(
                    'text-xs',
                    trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  )}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </Badge>
              )}
            </div>
            {description && (
              <p className='text-xs text-muted-foreground'>{description}</p>
            )}
          </div>
          <div className='p-3 bg-primary/10 rounded-full'>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface UsageProgressProps {
  title: string;
  current: number;
  max: number;
  unit: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

function UsageProgress({ title, current, max, unit, color = 'blue' }: UsageProgressProps) {
  const percentage = Math.min((current / max) * 100, 100);
  const isNearLimit = percentage > 80;
  const isOverLimit = percentage >= 100;

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  };

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium'>{title}</span>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>
            {current.toLocaleString()} / {max.toLocaleString()} {unit}
          </span>
          {isOverLimit ? (
            <AlertTriangle className='h-4 w-4 text-red-500' />
          ) : isNearLimit ? (
            <AlertTriangle className='h-4 w-4 text-yellow-500' />
          ) : (
            <CheckCircle className='h-4 w-4 text-green-500' />
          )}
        </div>
      </div>
      <Progress 
        value={percentage} 
        className={cn(
          'h-2',
          isOverLimit && 'bg-red-100',
          isNearLimit && !isOverLimit && 'bg-yellow-100'
        )}
      />
      <p className='text-xs text-muted-foreground'>
        {isOverLimit 
          ? '已超出限制' 
          : isNearLimit 
            ? '接近限制' 
            : `剩余 ${(max - current).toLocaleString()} ${unit}`
        }
      </p>
    </div>
  );
}

export function StatsDashboard() {
  const { stats } = useAppStore();

  // 模拟每日限制（从环境变量或配置中获取）
  const dailyLimits = {
    requests: 1000,
    tokens: 100000,
    cost: 50, // 人民币
  };

  // 计算今日使用情况（这里简化为总使用情况）
  const todayUsage = {
    requests: stats.totalAnalyses,
    tokens: stats.totalTokensUsed,
    cost: stats.totalCost,
  };

  // 计算平均值
  const avgTokensPerAnalysis = stats.totalAnalyses > 0 
    ? Math.round(stats.totalTokensUsed / stats.totalAnalyses)
    : 0;
  
  const avgCostPerAnalysis = stats.totalAnalyses > 0
    ? stats.totalCost / stats.totalAnalyses
    : 0;

  return (
    <div className='space-y-6'>
      {/* 概览统计 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatsCard
          title='总分析次数'
          value={stats.totalAnalyses}
          description='累计批改作文数量'
          icon={<FileText className='h-5 w-5 text-primary' />}
        />
        
        <StatsCard
          title='总Token使用'
          value={stats.totalTokensUsed.toLocaleString()}
          description='累计消耗的Token数量'
          icon={<Zap className='h-5 w-5 text-primary' />}
        />
        
        <StatsCard
          title='总成本'
          value={`¥${stats.totalCost.toFixed(4)}`}
          description='累计API调用成本'
          icon={<DollarSign className='h-5 w-5 text-primary' />}
        />
        
        <StatsCard
          title='最后分析'
          value={stats.lastAnalysisTime 
            ? new Date(stats.lastAnalysisTime).toLocaleDateString()
            : '暂无'
          }
          description='最近一次分析时间'
          icon={<Clock className='h-5 w-5 text-primary' />}
        />
      </div>

      {/* 平均使用情况 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BarChart3 className='h-5 w-5' />
            平均使用情况
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>平均Token/次</span>
                <span className='text-lg font-bold text-primary'>
                  {avgTokensPerAnalysis.toLocaleString()}
                </span>
              </div>
              <p className='text-xs text-muted-foreground'>
                每次分析平均消耗的Token数量
              </p>
            </div>
            
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>平均成本/次</span>
                <span className='text-lg font-bold text-primary'>
                  ¥{avgCostPerAnalysis.toFixed(4)}
                </span>
              </div>
              <p className='text-xs text-muted-foreground'>
                每次分析平均成本
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 使用限制监控 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            今日使用情况
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <UsageProgress
            title='API调用次数'
            current={todayUsage.requests}
            max={dailyLimits.requests}
            unit='次'
            color='blue'
          />
          
          <UsageProgress
            title='Token使用量'
            current={todayUsage.tokens}
            max={dailyLimits.tokens}
            unit='tokens'
            color='green'
          />
          
          <UsageProgress
            title='成本消耗'
            current={todayUsage.cost}
            max={dailyLimits.cost}
            unit='元'
            color='yellow'
          />
        </CardContent>
      </Card>

      {/* 成本优化建议 */}
      {stats.totalAnalyses > 0 && (
        <Card className='bg-blue-50 border-blue-200'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-blue-900'>
              <TrendingUp className='h-5 w-5' />
              成本优化建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3 text-sm text-blue-800'>
              {avgTokensPerAnalysis > 3000 && (
                <div className='flex items-start gap-2'>
                  <span className='text-blue-600 mt-0.5'>💡</span>
                  <span>
                    平均Token使用量较高({avgTokensPerAnalysis})，建议优化图片质量或裁剪不必要的内容
                  </span>
                </div>
              )}
              
              {stats.totalCost > 10 && (
                <div className='flex items-start gap-2'>
                  <span className='text-blue-600 mt-0.5'>💰</span>
                  <span>
                    累计成本已达¥{stats.totalCost.toFixed(2)}，建议设置每日成本限制
                  </span>
                </div>
              )}
              
              <div className='flex items-start gap-2'>
                <span className='text-blue-600 mt-0.5'>📊</span>
                <span>
                  定期监控使用情况，合理控制分析频率以优化成本
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}