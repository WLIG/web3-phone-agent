# Web3手机代理系统 - 安装指南

## 快速开始

### 1. 安装依赖
```bash
bun install
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，设置 NEXTAUTH_SECRET
```

### 3. 初始化数据库
```bash
bun run db:setup
```

### 4. 启动开发服务器

**Windows 环境（推荐）：**
```bash
node node_modules/next/dist/bin/next dev -p 3000
```

**其他环境：**
```bash
bun run dev
```

> ⚠️ **注意**: Windows 环境下 `bun run dev` 可能因为 `tee` 命令不可用而失败，请直接使用 node 命令启动。

访问 http://localhost:3000

## 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@web3phone.com | admin123 |
| 一级代理 | agent1@web3phone.com | 123456 |
| 二级代理 | agent2@web3phone.com | 123456 |

## 小程序功能模块

### 1. 代理中心
- 我的团队（下级代理列表、层级关系）
- 邀请码/推广链接生成
- 团队业绩统计（直属下级、间接下级、团队销售额）

### 2. 佣金体系
- 实时佣金看板（今日/本周/本月）
- 佣金明细（直推佣金、团队佣金）
- 佣金规则说明

### 3. 素材中心
- 推广素材库（图片/视频）
- 话术模板（WhatsApp、朋友圈、客户跟进）
- 一键复制/下载

### 4. 订单追踪
- 我推广的订单列表
- 订单状态实时显示

### 5. 提现功能
- 余额展示
- 提现申请（Mobile Money/银行卡/加密货币）
- 提现记录

### 6. 培训中心
- 课程列表
- 学习进度追踪

### 7. 数据看板
- 业绩统计
- 排行榜入口

## API接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/auth/register | POST | 用户注册 |
| /api/auth/[...nextauth] | GET/POST | NextAuth认证 |
| /api/users | GET | 用户列表 |
| /api/users/[id] | GET/PUT/DELETE | 用户详情 |
| /api/agents | GET/POST | 代理列表/申请 |
| /api/agents/[id] | GET/PUT | 代理详情/审核 |
| /api/orders | GET/POST | 订单列表/创建 |
| /api/orders/[id] | GET/PUT | 订单详情/更新 |
| /api/products | GET/POST | 产品列表/创建 |
| /api/products/[id] | GET/PUT/DELETE | 产品详情 |
| /api/commissions | GET | 佣金记录 |
| /api/commissions/settle | POST | 佣金结算 |
| /api/withdrawals | GET/POST | 提现记录/申请 |
| /api/withdrawals/[id] | PUT | 提现处理 |
| /api/stats | GET | 统计数据 |
| /api/team | GET | 团队成员数据 |
| /api/materials | GET | 推广素材 |
| /api/tutorials | GET/POST | 培训课程 |

## 开发注意事项

### IDE Autofix 问题
如果 IDE 自动添加了 `import Error from 'next/error'`，请手动删除。这是因为代码中使用了 `Error` 关键字触发了 IDE 的自动导入。

**解决方案：**
1. 避免在代码中使用 `throw new Error()`，改用 `throw { message: '...' }`
2. 避免使用 `err instanceof Error`，改用类型检查

### 缓存问题
如果修改代码后页面没有更新：
1. 删除 `.next` 目录：`Remove-Item -Recurse -Force .next`
2. 重启开发服务器
3. 使用隐私窗口访问或按 `Ctrl+Shift+R` 强制刷新

## Docker部署

### 开发环境
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### 生产环境
```bash
docker-compose up --build -d
```

## 项目结构

```
├── prisma/              # 数据库模型
├── scripts/             # 脚本文件
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── api/        # API路由
│   │   ├── admin/      # 管理后台
│   │   ├── login/      # 登录页
│   │   ├── register/   # 注册页
│   │   └── mini-program/ # 小程序端
│   ├── components/     # React组件
│   ├── hooks/          # 自定义Hooks
│   ├── lib/            # 工具库
│   └── __tests__/      # 测试文件
├── .env.example        # 环境变量示例
├── Dockerfile          # Docker配置
└── docker-compose.yml  # Docker Compose配置
```
