import { NextRequest, NextResponse } from 'next/server';

// 配置常量
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

export async function POST(request: NextRequest) {
  try {
    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '没有找到上传的文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: '不支持的文件格式，请上传 JPG 或 PNG 格式的图片',
        },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: '文件大小超过限制，请上传小于 10MB 的图片',
        },
        { status: 400 }
      );
    }

    // 将文件转换为 Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        filename: file.name,
        size: file.size,
        type: file.type,
        base64: dataUrl,
        preview: dataUrl, // 用于前端预览
      },
    });
  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '文件上传失败，请重试',
      },
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