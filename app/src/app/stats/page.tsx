'use client';

import React, { useState } from 'react';
import { StatsDashboard } from '@/components/StatsDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/components/ui/toast';
import { 
  Settings, 
  BarChart3, 
  RefreshCw, 
  Download,
  AlertTriangle,
  Info,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function StatsPage() {
  const [isResetting, setIsResetting] = useState(false);
  const { stats, resetState } = useAppStore();
  const { addToast } = useToast();

  const handleResetStats = async () => {
    if (!confirm('确定要重置所有统计数据吗？此操作不可撤销。')) {
      return;
    }

    setIsResetting(true);
    
    try {
      // 模拟重置延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      resetState();
      
      addToast({
        type: 'success',
        title: '统计数据已重置',
        description: '所有使用统计和成本数据已清零',
        duration: 3000,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: '重置失败',
        description: '重置统计数据时发生错误，请重试',
        duration: 5000,
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportData = () => {
    const exportData = {
      stats,
      exportTime: new Date().toISOString(),
      version: '1.0.0',
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `essay-grader-stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: '数据导出成功',
      description: '统计数据已保存到本地文件',
      duration: 3000,
    });
  };

  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* 头部导航 */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-4'>
            <Link href='/'>
              <Button variant='outline' size='sm'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                返回首页
              </Button>
            </Link>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>使用统计</h1>
              <p className='text-muted-foreground'>
                查看API使用情况和成本分析
              </p>
            </div>
          </div>
          
          <div className='flex items-center gap-3'>
            <Button
              variant='outline'
              onClick={handleExportData}
              disabled={stats.totalAnalyses === 0}
            >
              <Download className='h-4 w-4 mr-2' />
              导出数据
            </Button>
            
            <Button
              variant='outline'
              onClick={handleResetStats}
              disabled={isResetting || stats.totalAnalyses === 0}
              className='text-red-600 border-red-200 hover:bg-red-50'
            >
              {isResetting ? (
                <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
              ) : (
                <RefreshCw className='h-4 w-4 mr-2' />
              )}
              重置统计
            </Button>
          </div>
        </div>

        {/* 状态提示 */}
        {stats.totalAnalyses === 0 ? (
          <Card className='mb-8 border-blue-200 bg-blue-50'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <Info className='h-5 w-5 text-blue-600' />
                <div>
                  <p className='font-medium text-blue-900'>暂无使用数据</p>
                  <p className='text-sm text-blue-700'>
                    开始分析作文后，这里将显示详细的使用统计和成本分析
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className='mb-8 border-green-200 bg-green-50'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <BarChart3 className='h-5 w-5 text-green-600' />
                <div>
                  <p className='font-medium text-green-900'>
                    已完成 {stats.totalAnalyses} 次分析
                  </p>
                  <p className='text-sm text-green-700'>
                    累计使用 {stats.totalTokensUsed.toLocaleString()} tokens，
                    总成本 ¥{stats.totalCost.toFixed(4)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 统计仪表板 */}
        <StatsDashboard />

        {/* API配置信息 */}
        <Card className='mt-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              API配置信息
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>模型</span>
                  <Badge variant='secondary'>智谱GLM-4.5V</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>输入价格</span>
                  <span className='text-sm text-muted-foreground'>¥0.05/1K tokens</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>输出价格</span>
                  <span className='text-sm text-muted-foreground'>¥0.15/1K tokens</span>
                </div>
              </div>
              
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>每日请求限制</span>
                  <span className='text-sm text-muted-foreground'>1,000 次</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>单次Token限制</span>
                  <span className='text-sm text-muted-foreground'>4,000 tokens</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>超时设置</span>
                  <span className='text-sm text-muted-foreground'>30 秒</span>
                </div>
              </div>
            </div>
            
            <div className='pt-4 border-t'>
              <div className='flex items-start gap-2'>
                <AlertTriangle className='h-4 w-4 text-yellow-600 mt-0.5' />
                <div className='text-sm text-muted-foreground'>
                  <p className='font-medium text-gray-900 mb-1'>注意事项：</p>
                  <ul className='space-y-1 text-xs'>
                    <li>• 价格仅为估算，实际费用以智谱AI官方计费为准</li>
                    <li>• 建议设置合理的使用限制以控制成本</li>
                    <li>• 定期检查API密钥的有效性和余额</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}