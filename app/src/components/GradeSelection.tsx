'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Target, 
  Award,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GradeLevel, GradeInfo } from '@/types';

interface GradeSelectionProps {
  selectedGrade: GradeLevel | null;
  onGradeSelect: (grade: GradeLevel) => void;
  className?: string;
}

const GRADES: GradeInfo[] = [
  {
    id: 'grade-3',
    name: '三年级',
    description: '写作启蒙阶段',
    ageRange: '8-9岁',
    focus: '基础写作能力、句子完整性、标点符号'
  },
  {
    id: 'grade-4',
    name: '四年级',
    description: '段落写作能力',
    ageRange: '9-10岁',
    focus: '段落结构、细节描写、语句连贯'
  },
  {
    id: 'grade-5',
    name: '五年级',
    description: '篇章结构思维',
    ageRange: '10-11岁',
    focus: '篇章结构、逻辑思维、内容深度'
  },
  {
    id: 'grade-6',
    name: '六年级',
    description: '深度思考素养',
    ageRange: '11-12岁',
    focus: '思想深度、文学素养、创新能力'
  }
];

export function GradeSelection({ selectedGrade, onGradeSelect, className }: GradeSelectionProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardContent className='p-6'>
        <div className='space-y-4'>
          {/* 标题 */}
          <div className='text-center space-y-2'>
            <div className='flex items-center justify-center gap-2'>
              <BookOpen className='h-6 w-6 text-primary' />
              <h3 className='text-xl font-semibold'>选择学生年级</h3>
            </div>
            <p className='text-sm text-muted-foreground'>
              系统将根据年级特点提供针对性的批改建议
            </p>
          </div>

          {/* 年级选项 */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {GRADES.map((grade) => (
              <Button
                key={grade.id}
                variant={selectedGrade === grade.id ? 'default' : 'outline'}
                className={cn(
                  'h-auto p-4 flex flex-col items-start text-left space-y-2 transition-all duration-200',
                  selectedGrade === grade.id 
                    ? 'border-primary bg-primary/5 hover:bg-primary/10' 
                    : 'hover:bg-muted/50'
                )}
                onClick={() => onGradeSelect(grade.id)}
              >
                {/* 年级标题 */}
                <div className='flex items-center justify-between w-full'>
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold text-lg'>{grade.name}</span>
                    {selectedGrade === grade.id && (
                      <Check className='h-4 w-4 text-primary' />
                    )}
                  </div>
                  <Badge 
                    variant={selectedGrade === grade.id ? 'default' : 'secondary'}
                    className='text-xs'
                  >
                    {grade.ageRange}
                  </Badge>
                </div>

                {/* 描述 */}
                <p className='text-sm text-muted-foreground font-medium'>
                  {grade.description}
                </p>

                {/* 重点标签 */}
                <div className='flex items-center gap-1 flex-wrap'>
                  <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                    <Target className='h-3 w-3' />
                    <span className='font-medium'>重点:</span>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {grade.focus}
                  </span>
                </div>

                {/* 特色图标 */}
                <div className='flex items-center gap-2 mt-1'>
                  {grade.id === 'grade-3' && (
                    <Users className='h-4 w-4 text-blue-500' />
                  )}
                  {grade.id === 'grade-4' && (
                    <Target className='h-4 w-4 text-green-500' />
                  )}
                  {grade.id === 'grade-5' && (
                    <BookOpen className='h-4 w-4 text-purple-500' />
                  )}
                  {grade.id === 'grade-6' && (
                    <Award className='h-4 w-4 text-orange-500' />
                  )}
                  <span className='text-xs text-muted-foreground'>
                    {grade.id === 'grade-3' && '基础培养'}
                    {grade.id === 'grade-4' && '能力提升'}
                    {grade.id === 'grade-5' && '思维训练'}
                    {grade.id === 'grade-6' && '素养提升'}
                  </span>
                </div>
              </Button>
            ))}
          </div>

          {/* 提示信息 */}
          {selectedGrade && (
            <div className='mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
              <div className='flex items-start gap-3'>
                <BookOpen className='h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0' />
                <div className='space-y-1'>
                  <h4 className='font-medium text-blue-900'>
                    已选择：{GRADES.find(g => g.id === selectedGrade)?.name}
                  </h4>
                  <p className='text-sm text-blue-700'>
                    系统将根据{GRADES.find(g => g.id === selectedGrade)?.focus}提供针对性的批改建议
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 选择提示 */}
          {!selectedGrade && (
            <div className='text-center p-4 bg-amber-50 border border-amber-200 rounded-lg'>
              <p className='text-sm text-amber-800'>
                请先选择学生的年级，再进行作文批改
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}