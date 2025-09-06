# 智能作文批改助手 🤖✍️

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

**基于智谱GLM-4.5V多模态AI技术的智能作文批改系统**

专为小学生作文批改设计，提供专业、即时的写作反馈

[在线演示](#) • [快速开始](#快速开始) • [部署指南](#部署指南) • [API文档](#)

</div>

## ✨ 特性

### 🎯 核心功能
- **📸 智能图片识别**：支持手写作文图片上传，AI自动识别文字内容
- **🤖 多维度评价**：从书写、内容、结构、语言四个维度进行专业评价
- **📊 可视化展示**：雷达图直观展示各项得分，配合详细建议
- **💡 个性化建议**：基于AI分析提供具体的改进建议和写作指导

### 🎨 用户体验
- **📱 响应式设计**：完美适配桌面端、平板和手机
- **🎭 现代化界面**：基于Shadcn/UI的美观组件设计
- **⚡ 流畅交互**：拖拽上传、实时预览、动画效果
- **🔄 智能重试**：网络异常自动重试，确保服务稳定

### 📈 监控统计
- **💰 成本监控**：实时追踪API使用成本和Token消耗
- **📊 使用统计**：详细的分析次数和性能指标
- **⚠️ 智能预警**：使用限制监控和成本优化建议
- **📤 数据导出**：支持统计数据导出和备份

### 🛡️ 技术特性
- **🔒 类型安全**：TypeScript全栈开发，编译时错误检查
- **🚀 性能优化**：Next.js 15 App Router，服务端渲染优化
- **🐳 容器化部署**：Docker支持，一键部署到生产环境
- **🔧 开发友好**：ESLint + Prettier，代码质量保证

## 🏗️ 技术架构

### 前端技术栈
```
Next.js 15        # React全栈框架
TypeScript        # 类型安全的JavaScript
Tailwind CSS v4   # 原子化CSS框架
Shadcn/UI         # 高质量React组件库
Zustand           # 轻量级状态管理
Recharts          # React图表库
Lucide React      # 现代化图标库
```

### 后端技术栈
```
Next.js API       # 服务端API路由
智谱GLM-4.5V      # 多模态AI模型
FormData处理      # 文件上传处理
```

### 开发工具
```
ESLint           # 代码质量检查
Prettier         # 代码格式化
TypeScript       # 静态类型检查
Docker           # 容器化部署
```

## 🚀 快速开始

### 环境要求
- Node.js 18.0+
- npm 或 yarn
- 智谱AI API密钥

### 1. 克隆项目
```bash
git clone https://github.com/your-username/smartgrader.git
cd smartgrader/app
```

### 2. 安装依赖
```bash
npm install
# 或
yarn install
```

### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量文件
nano .env.local
```

在 `.env.local` 中配置以下变量：
```bash
# 必需配置
ZHIPU_API_KEY=your_zhipu_api_key_here

# 可选配置
ZHIPU_FALLBACK_MODEL=glm-4v
API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
API_TIMEOUT=30000
MAX_DAILY_REQUESTS=1000
MAX_TOKENS_PER_REQUEST=4000
NEXT_PUBLIC_APP_NAME=智能作文批改助手
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 4. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

### 5. 访问应用
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🐳 Docker 部署

### 快速部署
```bash
# 使用 Docker Compose 一键部署
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f smartgrader
```

### 手动构建
```bash
# 构建镜像
docker build -t smartgrader .

# 运行容器
docker run -d \
  --name smartgrader \
  -p 3000:3000 \
  --env-file .env.local \
  smartgrader
```

详细部署说明请参考 [Docker部署指南](./DOCKER_DEPLOYMENT.md)

## 📖 使用指南

### 基本使用流程

1. **📤 上传作文图片**
   - 支持拖拽上传或点击选择
   - 支持 JPG、PNG 格式
   - 文件大小限制 10MB

2. **🤖 AI智能分析**
   - 自动识别手写文字
   - 多维度专业评价
   - 生成详细分析报告

3. **📊 查看分析结果**
   - 雷达图可视化展示
   - 详细的分维度评价
   - 个性化改进建议

4. **📈 监控使用情况**
   - 访问统计页面查看使用数据
   - 监控API成本和Token消耗
   - 导出统计数据

### 评价维度说明

| 维度 | 说明 | 评价标准 |
|------|------|----------|
| **字迹工整度** | 评估书写规范性和美观度 | 字体大小、笔画清晰度、排版整齐度 |
| **内容丰富度** | 评估文章内容的充实程度 | 主题明确、内容详实、想象力丰富 |
| **结构清晰度** | 评估文章组织结构 | 开头结尾、段落划分、逻辑连贯 |
| **语言表达力** | 评估语言运用能力 | 词汇丰富、句式多样、表达准确 |

## 🛠️ 开发指南

### 项目结构
```
app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # 主页面
│   │   ├── stats/             # 统计页面
│   │   ├── layout.tsx         # 根布局
│   │   └── api/               # API路由
│   │       ├── health/        # 健康检查
│   │       ├── upload/        # 文件上传
│   │       └── analyze/       # 作文分析
│   ├── components/            # React组件
│   │   ├── ui/               # 基础UI组件
│   │   ├── EssayUploader.tsx # 作文上传组件
│   │   ├── EssayResultDisplay.tsx # 结果展示
│   │   ├── RadarChart.tsx    # 雷达图组件
│   │   ├── ImageUpload.tsx   # 图片上传
│   │   └── StatsDashboard.tsx # 统计仪表板
│   ├── lib/                  # 工具库
│   │   ├── api.ts           # API调用封装
│   │   ├── store.ts         # 状态管理
│   │   ├── zhipu.ts         # 智谱API集成
│   │   ├── prompts.ts       # Prompt模板
│   │   └── utils.ts         # 工具函数
│   └── types/               # TypeScript类型定义
├── public/                  # 静态资源
├── package.json            # 项目依赖
├── tailwind.config.ts      # Tailwind配置
├── tsconfig.json          # TypeScript配置
├── next.config.ts         # Next.js配置
├── Dockerfile             # Docker镜像配置
├── docker-compose.yml     # 容器编排
└── nginx.conf            # Nginx配置
```

### 开发命令
```bash
# 开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 代码格式化
npm run format

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

### 代码规范
- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 规范
- 组件采用函数式组件 + Hooks
- 使用 Zustand 进行状态管理
- API 路由采用 Next.js App Router

## 🔧 配置说明

### 环境变量

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `ZHIPU_API_KEY` | ✅ | - | 智谱AI API密钥 |
| `ZHIPU_FALLBACK_MODEL` | ❌ | `glm-4v` | 备用模型 |
| `API_BASE_URL` | ❌ | `https://open.bigmodel.cn/api/paas/v4` | API基础URL |
| `API_TIMEOUT` | ❌ | `30000` | API超时时间(ms) |
| `MAX_DAILY_REQUESTS` | ❌ | `1000` | 每日最大请求数 |
| `MAX_TOKENS_PER_REQUEST` | ❌ | `4000` | 单次最大Token数 |
| `NEXT_PUBLIC_APP_NAME` | ❌ | `智能作文批改助手` | 应用名称 |
| `NEXT_PUBLIC_APP_VERSION` | ❌ | `1.0.0` | 应用版本 |

### API限制
- 文件大小限制：10MB
- 支持格式：JPG、PNG
- 单次分析Token限制：4000
- 请求超时时间：30秒

## 📊 性能指标

### 前端性能
- ✅ 首屏加载时间 < 2秒
- ✅ 交互响应时间 < 100ms
- ✅ 图片上传处理 < 1秒
- ✅ 组件懒加载优化

### 后端性能
- ✅ API响应时间 < 30秒
- ✅ 错误重试机制
- ✅ 超时处理
- ✅ 并发请求支持

### 用户体验
- ✅ 响应式设计
- ✅ 加载状态反馈
- ✅ 错误提示友好
- ✅ 操作流程直观

## 🔒 安全特性

### 数据安全
- ✅ 文件类型验证
- ✅ 文件大小限制
- ✅ 输入数据清理
- ✅ 错误信息脱敏

### API安全
- ✅ 请求超时控制
- ✅ 重试次数限制
- ✅ 错误处理机制
- ✅ 成本控制监控

## 🤝 贡献指南

### 开发流程
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码贡献
- 遵循现有代码风格
- 添加适当的测试
- 更新相关文档
- 确保所有检查通过

## 📝 更新日志

### v1.0.0 (2025-01-06)
- ✨ 初始版本发布
- 🤖 集成智谱GLM-4.5V AI模型
- 📸 实现图片上传和识别功能
- 📊 添加雷达图可视化展示
- 💰 实现成本监控和统计功能
- 🐳 支持Docker容器化部署
- 📱 响应式设计优化
- 🔧 完善的错误处理机制

## 🆘 故障排除

### 常见问题

**Q: API调用失败怎么办？**
A: 检查环境变量配置，确保 `ZHIPU_API_KEY` 正确设置，并验证网络连接。

**Q: 图片上传失败？**
A: 确认图片格式为JPG或PNG，文件大小不超过10MB，检查网络连接状态。

**Q: Docker部署失败？**
A: 检查Docker版本，确保环境变量文件存在，查看容器日志排查问题。

**Q: 页面加载缓慢？**
A: 检查网络连接，清除浏览器缓存，确认服务器资源充足。

更多问题请查看 [故障排除指南](./DOCKER_DEPLOYMENT.md#故障排除)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Shadcn/UI](https://ui.shadcn.com/) - UI组件库
- [智谱AI](https://open.bigmodel.cn/) - AI模型服务
- [Recharts](https://recharts.org/) - 图表库
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理

## 📞 联系我们

- 项目主页：[GitHub Repository](#)
- 问题反馈：[Issues](#)
- 邮箱：your-email@example.com

---

<div align="center">

**如果这个项目对您有帮助，请给我们一个 ⭐️**

Made with ❤️ by [Your Name]

</div>