# WebSocket 连接故障排除指南

## 问题描述
WebSocket 连接失败: `WebSocket connection to 'wss://freesavevideo.online/ws' failed:`

## 解决方案

### 1. GCP/GKE WebSocket 支持要求

GCP 的 Google Kubernetes Engine (GKE) 支持 WebSocket，但需要特定配置：

#### HTTP(S) 负载均衡器
- GKE Ingress 默认支持 WebSocket 连接升级
- 确保使用 HTTPS (wss://) 而不是 HTTP (ws://)

#### 防火墙规则
GCP 不需要特殊的端口配置，因为 WebSocket 使用标准的 HTTP/HTTPS 端口：
- HTTP: 80
- HTTPS: 443

### 2. 已实施的修复

#### 客户端修复
- ✅ 修复了 WebSocket URL，现在连接到正确的 API 域名
- ✅ 生产环境使用 `wss://api.freesavevideo.online/ws`

#### 服务器配置
- ✅ 添加了详细的连接日志
- ✅ 添加了健康检查端点 `/health` 和 `/ws/health`
- ✅ WebSocket 服务器监听路径 `/ws`

#### Kubernetes 配置
- ✅ Ingress 配置支持 WebSocket 协议升级
- ✅ 添加了 GKE 特定的注解

### 3. 部署步骤

1. **构建并推送新的 Docker 镜像**:
```bash
# 在项目根目录
docker build -t gcr.io/你的项目ID/cobalt:latest .
docker push gcr.io/你的项目ID/cobalt:latest
```

2. **更新 Helm Chart**:
```bash
# 更新 values.yaml 中的镜像标签
helm upgrade cobalt-api ./cobalt-chart --namespace default
```

3. **验证部署**:
```bash
# 检查 Pod 状态
kubectl get pods -l app.kubernetes.io/name=cobalt-chart

# 检查服务状态
kubectl get svc

# 检查 Ingress 状态
kubectl get ingress

# 查看 Pod 日志
kubectl logs -l app.kubernetes.io/name=cobalt-chart -f
```

### 4. 测试连接

#### 健康检查
```bash
# 测试 API 健康状态
curl https://api.freesavevideo.online/health

# 测试 WebSocket 健康状态  
curl https://api.freesavevideo.online/ws/health
```

#### WebSocket 连接测试
使用浏览器开发者工具测试：
```javascript
// 在浏览器控制台中测试
const ws = new WebSocket('wss://api.freesavevideo.online/ws');
ws.onopen = () => console.log('WebSocket 连接成功');
ws.onerror = (error) => console.error('WebSocket 错误:', error);
ws.onclose = () => console.log('WebSocket 连接关闭');
```

### 5. 常见问题

#### 5.1 SSL/TLS 证书问题
如果遇到证书问题：
```bash
# 检查证书状态
kubectl describe managedcertificate apifreesavevideo-tls
```

#### 5.2 负载均衡器配置问题
```bash
# 检查负载均衡器状态
kubectl describe ingress

# 查看负载均衡器事件
kubectl get events --sort-by=.metadata.creationTimestamp
```

#### 5.3 网络连接问题
```bash
# 从 Pod 内部测试网络
kubectl exec -it <pod-name> -- curl localhost:80/health

# 测试 WebSocket 端点
kubectl exec -it <pod-name> -- curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" \
  -H "Sec-WebSocket-Version: 13" \
  http://localhost:80/ws
```

### 6. 监控和日志

#### 查看实时日志
```bash
# 查看所有 Pod 的日志
kubectl logs -l app.kubernetes.io/name=cobalt-chart -f --all-containers=true

# 过滤 WebSocket 相关日志
kubectl logs -l app.kubernetes.io/name=cobalt-chart -f | grep -i websocket
```

#### 检查连接统计
在应用日志中查找：
- "WebSocket连接建立"
- "WebSocket信令服务器启动成功"
- 连接的客户端 IP 地址

### 7. GCP 特定配置

GCP 不需要特殊的防火墙端口配置，因为：
- WebSocket 使用标准 HTTP/HTTPS 端口 (80/443)
- GKE Ingress 自动处理协议升级
- 负载均衡器支持长连接和 WebSocket

如果仍有问题，检查：
1. VPC 防火墙规则是否阻止了连接
2. GKE 集群的网络策略
3. Pod 的安全上下文设置
