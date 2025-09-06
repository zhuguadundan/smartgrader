import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const testData = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasZhipuKey: !!process.env.ZHIPU_API_KEY,
      apiBaseUrl: process.env.API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
      apiTimeout: process.env.API_TIMEOUT || '30000',
    },
    endpoints: {
      upload: '/api/upload',
      analyze: '/api/analyze',
    },
    limits: {
      maxFileSize: '10MB',
      allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    },
  };

  return NextResponse.json({
    success: true,
    message: 'API服务正常运行',
    data: testData,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'POST请求测试成功',
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: '请求解析失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 400 }
    );
  }
}