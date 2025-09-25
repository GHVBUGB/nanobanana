# AI Image Platform

一个基于 Next.js 和 Nano Banana API 的智能图片生成和编辑平台。

## 功能特性

- 🎨 **智能图片生成**: 支持中文提示词，使用 Nano Banana 模型生成高质量图片
- 🖼️ **图片编辑**: 上传参考图片，进行背景替换、风格转换等编辑操作
- 🔄 **实时进度**: 智能进度条显示生成状态
- 💾 **数据持久化**: 集成 Supabase 数据库存储用户数据
- 🌐 **响应式设计**: 支持桌面和移动端访问
- 🔒 **用户认证**: 完整的用户注册登录系统

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **AI模型**: Nano Banana API
- **部署**: Vercel

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 环境变量配置

创建 `.env.local` 文件并配置以下环境变量：

```env
# Nano Banana API
OPENAI_API_KEY=your_nano_banana_api_key
OPENAI_API_BASE=https://newapi.aisonnet.org/v1

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth (可选)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
ai-image-platform/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API 路由
│   ├── auth/              # 认证页面
│   ├── dashboard/         # 仪表板
│   └── community/         # 社区页面
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── auth/             # 认证组件
│   └── modules/          # 功能模块组件
├── lib/                  # 工具库
│   ├── nano-banana-api.ts # Nano Banana API 集成
│   ├── supabase.ts       # Supabase 客户端
│   └── task-manager.ts   # 任务管理
├── hooks/                # React Hooks
└── public/               # 静态资源
```

## 核心功能

### 图片生成

支持多种生成模式：
- 文本生图：输入中文描述生成图片
- 图片编辑：基于参考图片进行编辑
- 风格转换：将图片转换为不同艺术风格

### 任务管理

- 异步任务处理
- 实时进度跟踪
- 自动重试机制
- 错误处理和恢复

### 用户系统

- 用户注册和登录
- 个人作品管理
- 社区图片分享
- 点赞和收藏功能

## API 文档

### 生成图片

```http
POST /api/generate/standard
Content-Type: application/json

{
  "description": "一只可爱的小猫咪在花园里玩耍",
  "referenceImage": "base64_encoded_image" // 可选
}
```

### 查询任务状态

```http
GET /api/task/{taskId}/status
```

## 部署

### Vercel 部署

1. Fork 此仓库
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 自定义部署

```bash
npm run build
npm start
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 更新日志

### v1.0.0 (2024-01-XX)

- ✨ 初始版本发布
- 🎨 支持中文图片生成
- 🖼️ 图片编辑功能
- 💾 Supabase 数据库集成
- 🔄 智能进度显示
- 🔒 用户认证系统

## 支持

如有问题，请提交 [Issue](https://github.com/your-username/ai-image-platform/issues)。