/**
 * 智谱GLM-4.5V API测试脚本
 * 用于验证API连通性和响应格式
 */

// 模拟环境变量（实际使用时应从环境变量读取）
const ZHIPU_API_KEY = 'your-api-key-here';

/**
 * 调用智谱GLM-4.5V API
 * @param {string} imageBase64 - Base64编码的图片
 * @param {string} prompt - 分析提示词
 * @param {boolean} stream - 是否使用流式响应
 * @returns {Promise<Object>} API响应
 */
async function callGLM4V(imageBase64, prompt, stream = false) {
  const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  
  const requestBody = {
    model: 'glm-4.5v',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }
    ],
    thinking: {
      type: 'enabled'
    }
  };

  if (stream) {
    requestBody.stream = true;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ZHIPU_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API调用失败: ${response.status} - ${errorData.error?.message || '未知错误'}`);
    }

    if (stream) {
      return handleStreamResponse(response);
    } else {
      return await response.json();
    }
  } catch (error) {
    console.error('API调用错误:', error);
    throw error;
  }
}

/**
 * 处理流式响应
 * @param {Response} response - Fetch响应对象
 * @returns {Promise<string>} 完整的响应内容
 */
async function handleStreamResponse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            return fullContent;
          }
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              console.log(content); // 实时输出
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
  
  return fullContent;
}

/**
 * 测试API连通性
 */
async function testAPIConnection() {
  console.log('开始测试智谱GLM-4.5V API连通性...');
  
  // 测试用的简单图片（1x1像素的透明PNG）
  const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  const testPrompt = '请简单描述这张图片';

  try {
    // 测试标准调用
    console.log('\n=== 测试标准API调用 ===');
    const standardResponse = await callGLM4V(testImageBase64, testPrompt, false);
    console.log('标准调用成功!');
    console.log('响应内容:', standardResponse.choices[0].message.content);
    console.log('Token使用量:', standardResponse.usage);

    // 测试流式调用
    console.log('\n=== 测试流式API调用 ===');
    const streamContent = await callGLM4V(testImageBase64, testPrompt, true);
    console.log('\n流式调用成功!');
    console.log('完整内容:', streamContent);

  } catch (error) {
    console.error('API测试失败:', error.message);
    
    // 提供调试信息
    if (error.message.includes('401')) {
      console.log('\n调试提示: 请检查API Key是否正确设置');
    } else if (error.message.includes('429')) {
      console.log('\n调试提示: 请求频率过高，请稍后重试');
    } else if (error.message.includes('400')) {
      console.log('\n调试提示: 请求参数可能有误，请检查请求格式');
    }
  }
}

/**
 * 作文批改专用的API调用函数
 * @param {string} imageBase64 - 作文图片的Base64编码
 * @returns {Promise<Object>} 结构化的批改结果
 */
async function analyzeEssay(imageBase64) {
  const prompt = `请作为一位经验丰富的小学语文老师，对这篇作文进行全面批改。请按照以下JSON格式返回结果：

{
  "overall_score": 85,
  "dimensions": {
    "handwriting": {
      "score": 80,
      "comment": "字迹工整度评价"
    },
    "content": {
      "score": 90,
      "comment": "内容丰富度评价"
    },
    "structure": {
      "score": 85,
      "comment": "结构清晰度评价"
    },
    "language": {
      "score": 85,
      "comment": "语言表达力评价"
    }
  },
  "highlights": [
    "这篇作文的亮点1",
    "这篇作文的亮点2"
  ],
  "suggestions": [
    "具体的改进建议1",
    "具体的改进建议2"
  ],
  "overall_comment": "总体评价，语气要积极鼓励，先表扬再提建议"
}

请确保：
1. 评分范围在60-100分之间
2. 评语要具体、有建设性
3. 语气要积极鼓励，适合小学生理解
4. 严格按照JSON格式返回，不要包含其他内容`;

  try {
    const response = await callGLM4V(imageBase64, prompt, false);
    const content = response.choices[0].message.content;
    
    // 尝试解析JSON响应
    try {
      const result = JSON.parse(content);
      return {
        success: true,
        data: result,
        usage: response.usage
      };
    } catch (parseError) {
      console.warn('JSON解析失败，返回原始内容:', parseError);
      return {
        success: false,
        rawContent: content,
        usage: response.usage,
        error: 'JSON解析失败'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// 如果直接运行此脚本，执行测试
if (typeof window === 'undefined' && require.main === module) {
  testAPIConnection();
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    callGLM4V,
    analyzeEssay,
    testAPIConnection
  };
}