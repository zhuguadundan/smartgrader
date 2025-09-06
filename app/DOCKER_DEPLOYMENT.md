# Docker 部署指南

## 快速开始

### 1. 环境准备

确保您的系统已安装：
- Docker (版本 20.10+)
- Docker Compose (版本 2.0+)

### 2. 环境变量配置

复制环境变量示例文件：
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入您的配置：
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

### 3. 构建和启动

#### 方式一：使用 Docker Compose（推荐）

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f smartgrader
```

#### 方式二：使用 Docker 命令

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

### 4. 访问应用

- 应用地址：http://localhost:3000
- 如果启用了 Nginx：http://localhost

## 部署配置

### Next.js 配置

为了支持 Docker 部署，需要在 `next.config.js` 中添加以下配置：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
}

module.exports = nextConfig
```

### 健康检查

应用包含健康检查端点：`/api/health`

Docker Compose 配置了自动健康检查：
- 检查间隔：30秒
- 超时时间：10秒
- 重试次数：3次
- 启动等待：40秒

## 生产环境部署

### 1. 安全配置

#### 环境变量安全
```bash
# 使用 Docker secrets（推荐）
echo "your_api_key" | docker secret create zhipu_api_key -

# 或使用加密的环境变量文件
gpg -c .env.local
```

#### SSL/TLS 配置
```bash
# 生成自签名证书（测试用）
mkdir ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem

# 启用 HTTPS（取消注释 nginx.conf 中的 HTTPS 配置）
```

### 2. 性能优化

#### 资源限制
```yaml
# docker-compose.yml
services:
  smartgrader:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

#### 缓存配置
```bash
# 启用 Redis 缓存（可选）
docker run -d --name redis -p 6379:6379 redis:alpine
```

### 3. 监控和日志

#### 日志管理
```bash
# 查看实时日志
docker-compose logs -f

# 日志轮转配置
docker-compose up -d --log-opt max-size=10m --log-opt max-file=3
```

#### 监控配置
```yaml
# 添加监控服务（可选）
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

## 常用命令

### 容器管理
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f [service_name]
```

### 镜像管理
```bash
# 重新构建镜像
docker-compose build --no-cache

# 拉取最新镜像
docker-compose pull

# 清理未使用的镜像
docker image prune -f
```

### 数据管理
```bash
# 备份数据（如果有持久化数据）
docker-compose exec smartgrader tar czf /tmp/backup.tar.gz /app/data

# 恢复数据
docker cp container_id:/tmp/backup.tar.gz ./backup.tar.gz
```

## 故障排除

### 常见问题

#### 1. 容器启动失败
```bash
# 检查日志
docker-compose logs smartgrader

# 检查配置
docker-compose config
```

#### 2. API 调用失败
```bash
# 检查环境变量
docker-compose exec smartgrader env | grep ZHIPU

# 测试网络连接
docker-compose exec smartgrader curl -I https://open.bigmodel.cn
```

#### 3. 内存不足
```bash
# 检查资源使用
docker stats

# 增加内存限制
# 修改 docker-compose.yml 中的 memory 配置
```

#### 4. 端口冲突
```bash
# 检查端口占用
netstat -tulpn | grep :3000

# 修改端口映射
# 在 docker-compose.yml 中修改 ports 配置
```

### 调试模式

```bash
# 以调试模式启动
docker-compose -f docker-compose.yml -f docker-compose.debug.yml up

# 进入容器调试
docker-compose exec smartgrader sh
```

## 更新部署

### 滚动更新
```bash
# 拉取最新代码
git pull origin main

# 重新构建并更新
docker-compose up -d --build

# 验证更新
curl -f http://localhost:3000/api/health
```

### 回滚部署
```bash
# 回滚到上一个版本
git checkout HEAD~1

# 重新部署
docker-compose up -d --build
```

## 扩展配置

### 多实例部署
```yaml
# docker-compose.yml
services:
  smartgrader:
    deploy:
      replicas: 3
    ports:
      - "3000-3002:3000"
```

### 负载均衡
```yaml
# 使用 Nginx 负载均衡
upstream smartgrader {
    server smartgrader_1:3000;
    server smartgrader_2:3000;
    server smartgrader_3:3000;
}
```

## 安全建议

1. **定期更新**：保持 Docker 镜像和依赖的最新版本
2. **最小权限**：使用非 root 用户运行容器
3. **网络隔离**：使用 Docker 网络隔离服务
4. **密钥管理**：使用 Docker secrets 管理敏感信息
5. **监控日志**：定期检查应用和系统日志
6. **备份策略**：制定数据备份和恢复计划

---

如有问题，请查看项目文档或提交 Issue。