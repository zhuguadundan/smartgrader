# 智谱GLM-4.5V API集成文档

## API基本信息

- **API端点**: `https://open.bigmodel.cn/api/paas/v4/chat/completions`
- **认证方式**: Bearer Token
- **模型名称**: `glm-4.5v`
- **支持模态**: 图像、视频、文件、文本

## 认证配置

```javascript
const headers = {
  'Authorization': `Bearer ${process.env.ZHIPU_API_KEY}`,
  'Content-Type': 'application/json'
}
```

## 请求格式

### 基础图片分析请求
```javascript
const requestBody = {
  model: 'glm-4.5v',
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: {
            url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...' // Base64编码的图片
          }
        },
        {
          type: 'text',
          text: '请分析这篇作文的质量'
        }
      ]
    }
  ],
  thinking: {
    type: 'enabled' // 启用深度思考模式
  }
}
```

### 流式响应请求
```javascript
const streamRequestBody = {
  ...requestBody,
  stream: true
}
```

## 响应格式

### 标准响应
```javascript
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "glm-4.5v",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "分析结果..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 200,
    "total_tokens": 300
  }
}
```

### 流式响应
```javascript
data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","created":1234567890,"model":"glm-4.5v","choices":[{"index":0,"delta":{"content":"分析"},"finish_reason":null}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","created":1234567890,"model":"glm-4.5v","choices":[{"index":0,"delta":{"content":"结果"},"finish_reason":null}]}

data: [DONE]
```

## 错误处理

### 常见错误码
- `400`: 请求参数错误
- `401`: API Key无效
- `429`: 请求频率超限
- `500`: 服务器内部错误

### 错误响应格式
```javascript
{
  "error": {
    "message": "Invalid API key",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

## 成本控制

### Token计算
- 图片输入：根据图片分辨率计算，通常比文本更昂贵
- 文本输入：按字符数计算
- 输出：按生成的字符数计算

### 并发限制
- V0用户：10并发
- V1用户：30并发
- V2用户：50并发
- 更高等级用户可获得更多并发

## 最佳实践

1. **图片优化**: 压缩图片到合适尺寸，减少Token消耗
2. **错误重试**: 实现指数退避重试机制
3. **超时设置**: 设置合理的请求超时时间
4. **成本监控**: 记录每次调用的Token使用量
5. **降级策略**: 准备备用模型（如GLM-4V）作为降级方案

## 安全注意事项

1. **API Key保护**: 
   - 使用环境变量存储API Key
   - 不要在前端代码中暴露API Key
   - 定期轮换API Key

2. **请求验证**:
   - 验证上传文件的格式和大小
   - 实现请求频率限制
   - 添加用户身份验证（如需要）

3. **数据隐私**:
   - 不在服务器端永久存储用户上传的图片
   - 遵循数据保护法规
   - 提供明确的隐私声明