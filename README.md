# 禅镜 — 小红书运营工具

专为佛学、心灵成长类创作者设计的小红书运营工具，让弘法之道，行于指尖。

**在线访问：** https://zenjing.vercel.app

---

## 七件法器

| 工具 | 功能 |
|------|------|
| **净言** | 实时检测违禁词，评分系统 |
| **转语** | AI 将法师讲座翻译为小红书风格 |
| **钩子** | 5种标题类型，生成15个备选标题 |
| **灵签** | 核心+长尾标签智能推荐 |
| **墨境** | 5种禅意模板，金句封面图生成 |
| **时序** | 周视图发布日历，本地数据持久化 |
| **观己** | AI 账号三维诊断 |

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/qiangzhang2009/jiqun-master.git
cd jiqun-master/xhs-tools
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 API Key

**方式一：本地开发环境变量文件**

```bash
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 DeepSeek API Key
```

**方式二：Vercel 环境变量（推荐用于生产）**

1. 登录 [Vercel](https://vercel.com)，导入项目
2. 进入 **Settings → Environment Variables**
3. 添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DEEPSEEK_API_KEY` | `sk-...` | DeepSeek API Key（推荐，性价比高） |

获取 DeepSeek API Key：https://platform.deepseek.com/api_keys

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 构建部署

```bash
npm run build
npm start
```

或一键部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/qiangzhang2009/jiqun-master)

---

## 技术栈

- **框架：** Next.js 15 (App Router)
- **语言：** TypeScript 5
- **样式：** Tailwind CSS 3.4 + CSS Variables
- **AI：** DeepSeek API（通过 fetch 调用）
- **字体：** Google Fonts (Noto Serif SC, Noto Sans SC, DM Sans)
- **部署：** 适配 Vercel（自动检测推送）

---

## 数据说明

所有数据（草稿、日历内容、历史记录）默认保存在浏览器 **localStorage** 中，不会上传到任何服务器。

如需跨设备同步，可自行接入 Supabase、Firebase 或其他数据库服务。

---

## 项目结构

```
xhs-tools/
├── app/
│   ├── api/ai/          # AI API 路由
│   ├── tools/           # 各工具页面
│   ├── lib/             # 工具库（违禁词、存储hook）
│   ├── layout.tsx       # 全局布局 + SEO metadata
│   ├── sitemap.ts       # 站点地图
│   └── robots.ts        # 搜索引擎爬虫规则
├── components/layout/    # 导航栏、页脚
└── .env.local.example   # 环境变量示例
```

---

## License

仅供学习与公益使用。
