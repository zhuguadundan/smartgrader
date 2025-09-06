import { NextRequest, NextResponse } from 'next/server';
import type { EssayAnalysisResult, ZhipuAPIRequest } from '@/types';
import { getZhipuService, ZhipuAPIError } from '@/lib/zhipu';
import { generateCustomPrompt, validateEssayResult } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    // 解析请求数据
    const { imageBase64, options = {} } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: '缺少图片数据' },
        { status: 400 }
      );
    }

    // 获取智谱API服务实例
    const zhipuService = getZhipuService();

    // 生成定制化的Prompt
    const prompt = generateCustomPrompt(options);

    // 构造API请求
    const apiRequest: ZhipuAPIRequest = {
      model: 'glm-4.5v', // 这个会被服务自动处理
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      thinking: {
        type: 'enabled',
      },
    };

    // 调用API（带重试和降级）
    const apiResponse = await zhipuService.callWithRetry(apiRequest);
    const content = apiResponse.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { success: false, error: '未收到有效的分析结果' },
        { status: 500 }
      );
    }

    // 记录API使用情况
    zhipuService.logUsage(apiResponse.usage);

    // 验证和解析JSON响应（已修复智谱GLM-4.5V包装标签问题）
    const validation = validateEssayResult(content);
    
    if (!validation.isValid) {
      console.error('结果验证失败:', validation.error, 'Content:', content);
      
      return NextResponse.json({
        success: false,
        error: `分析结果格式异常: ${validation.error}`,
        rawContent: content,
        usage: apiResponse.usage,
      });
    }

    const analysisResult: EssayAnalysisResult = validation.data!;

    return NextResponse.json({
      success: true,
      data: analysisResult,
      usage: apiResponse.usage,
      prompt_used: options, // 返回使用的Prompt配置，便于调试
    });
  } catch (error) {
    console.error('作文分析错误:', error);
    
    if (error instanceof ZhipuAPIError) {
      // 根据错误类型返回不同的HTTP状态码
      const statusCode = error.status || 500;
      return NextResponse.json(
        { success: false, error: error.message },
        { status: statusCode }
      );
    }
    
    return NextResponse.json(
      { success: false, error: '分析失败，请重试' },
      { status: 500 }
    );
  }
}

// 处理 OPTIONS 请求（CORS 预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}