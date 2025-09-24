# API密钥获取指南

## 🎯 概述
本指南将帮助你获取有效的AI图像生成API密钥，支持以下服务：
- Google Gemini API（推荐）
- OpenRouter API
- 其他替代方案

---

## 🔑 方案一：Google Gemini API（推荐）

### 步骤1：访问Google AI Studio
1. 打开浏览器，访问：https://aistudio.google.com/app/apikey
2. 使用你的Google账号登录

### 步骤2：创建API密钥
1. 点击 **"Create API key"** 按钮
2. 选择一个Google Cloud项目（如果没有会自动创建）
3. 复制生成的API密钥（格式：AIzaSy...）

### 步骤3：验证权限
1. 确保API密钥有访问Gemini模型的权限
2. 检查是否有免费配额（通常每月有一定免费额度）

### 步骤4：测试连接
```bash
# 使用curl测试
curl -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     -X POST 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY'
```

---

## 🌐 方案二：OpenRouter API

### 步骤1：注册账号
1. 访问：https://openrouter.ai/
2. 点击 **"Sign Up"** 注册新账号
3. 验证邮箱地址

### 步骤2：获取API密钥
1. 登录后访问：https://openrouter.ai/keys
2. 点击 **"Create Key"** 创建新密钥
3. 复制API密钥（格式：sk-or-v1-...）

### 步骤3：充值账户
1. 访问：https://openrouter.ai/credits
2. 添加信用额度（最低$5）
3. 选择支付方式完成充值

### 步骤4：测试API
```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "google/gemini-2.0-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## 🆓 方案三：免费替代方案

### Hugging Face API
1. 访问：https://huggingface.co/
2. 注册账号并获取免费API token
3. 使用免费的图像生成模型

### Replicate API
1. 访问：https://replicate.com/
2. 注册账号获取API token
3. 每月有免费使用额度

---

## ⚙️ 配置步骤

### 1. 更新环境变量
获取API密钥后，更新 `.env.local` 文件：

```env
# Google Gemini API 配置
GEMINI_API_KEY=你的_Gemini_API_密钥

# 或者使用 OpenRouter API
OPENROUTER_API_KEY=你的_OpenRouter_API_密钥
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_IMAGE_MODEL=google/gemini-2.0-flash
```

### 2. 重启开发服务器
```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

### 3. 测试API连接
运行测试脚本验证API密钥：
```bash
node test-api-key-validity.js
```

---

## 🚨 常见问题解决

### 问题1：API密钥无效
- **解决方案**：重新生成新的API密钥
- **检查**：确保复制完整的密钥，没有多余空格

### 问题2：网络连接失败
- **解决方案**：检查网络连接，可能需要VPN
- **替代**：使用OpenRouter等代理服务

### 问题3：配额不足
- **Gemini**：等待配额重置或升级到付费计划
- **OpenRouter**：充值账户余额

### 问题4：权限被拒绝
- **检查**：API密钥是否有正确的权限
- **解决**：重新创建密钥并确保权限设置正确

---

## 📞 获取帮助

如果遇到问题，可以：
1. 查看官方文档
2. 检查API服务状态页面
3. 联系客服支持

---

## 💡 推荐配置

**对于开发测试**：
- 使用Google Gemini API（有免费配额）
- 配置合理的请求频率限制

**对于生产环境**：
- 使用OpenRouter API（更稳定）
- 设置适当的错误处理和重试机制

---

*更新时间：2024年1月*