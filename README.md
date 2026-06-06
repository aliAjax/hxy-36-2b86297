# 应援物资管理系统

二次元应援物资管理工具，专为虚拟主播/企划应援组设计，用于离线整理和管理各类应援物资。所有数据保存在浏览器本地，无需联网即可使用。

## ✨ 核心功能

### 🎪 活动管理
- 活动列表概览，支持搜索筛选
- 活动创建、编辑、删除
- 活动状态管理（即将开始 / 进行中 / 已结束）
- 活动维度的物资统计和数据看板
- 活动复盘报告

### 📦 物资管理
- 支持多种物资类型：灯牌、手幅、贴纸、无料包、抽选礼物、其他
- 物资登记：名称、类型、设计稿链接、预算、供应商、库存、发放规则
- 库存管理：实时追踪当前库存和已发放数量
- 采购管理：采购流程跟踪（待采购 → 已下单 → 已发货 → 已完成）
- 待办事项：活动物资准备任务清单
- 重点物资标记：快速定位核心物资

### 📋 物资模板
- 将活动物资保存为模板，支持快速复用
- 模板库管理：创建、编辑、删除模板
- 应用模板到活动：支持库存倍率、预算倍率、供应商覆盖
- 模板独立性保证：模板与活动物资完全解耦，编辑模板不影响已创建的物资
- 部分物资选择：可选择性地从模板中导入部分物资

### 🎟️ 现场领取
- 快速领取登记：姓名、联系方式、领取数量
- 重复领取检测：自动检测并提示重复领取
- 批量领取：支持一次登记多人领取
- 领取记录：按时间排序，支持筛选
- 预领取名单：提前登记预约领取的粉丝
- 现场看板：实时展示领取进度和库存状态
- 低库存预警：自动识别库存低于阈值的物资

### 📥 数据导入合并
- JSON 格式数据导出备份
- 覆盖导入：直接用导入数据替换现有数据
- 合并导入：将导入数据与现有数据合并，ID 冲突自动重新生成
- 合并摘要：展示各类数据的新增、保留、重命名数量
- 数据清空：一键清空所有本地数据

### 🏥 数据健康检查
- 孤儿数据检测：无对应活动的物资、无对应活动/物资的领取记录
- 库存异常检测：负库存、库存与记录不一致
- 活动完整性检测：缺失日期、缺失状态
- 一键修复：自动修复所有可修复的问题
- 逐项修复：针对单个问题类型进行修复

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **状态管理**：Zustand（带 persist 中间件，LocalStorage 持久化）
- **路由管理**：React Router
- **UI 样式**：Tailwind CSS
- **图标库**：Lucide React
- **图表库**：Recharts
- **测试框架**：Vitest

## 🚀 快速开始

### 环境要求

- **Node.js >= 20.0.0**（Vitest 4.x 要求，推荐 20 LTS 或 22+）
- npm >= 7

> 主要依赖版本约束：
> - Vite 6.x：支持 Node.js 18 / 20 / 22+
> - Vitest 4.x：要求 Node.js >= 20.0.0、Vite >= 6.0.0
> - TypeScript 5.8：支持 Node.js 14.17+
> - tsx 4.x：支持 Node.js 18+（用于执行 `.mts` 验证脚本）

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

启动后访问 `http://localhost:5173` 即可使用。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

```
src/
├── components/           # 通用组件
│   ├── ActivityCard.tsx      # 活动卡片
│   ├── ActivityForm.tsx      # 活动表单
│   ├── ItemCard.tsx          # 物资卡片
│   ├── ItemForm.tsx          # 物资表单
│   ├── ClaimForm.tsx         # 领取登记表单
│   ├── BatchClaimForm.tsx    # 批量领取表单
│   ├── ClaimRecordItem.tsx   # 领取记录条目
│   ├── StatsCard.tsx         # 统计卡片
│   ├── ConsumptionChart.tsx  # 消耗趋势图
│   ├── TypeDistributionChart.tsx  # 类型分布图
│   ├── DataHealthCenter.tsx  # 数据健康检查中心
│   ├── MaterialTemplateItemForm.tsx  # 模板物资表单
│   ├── SaveAsTemplateDialog.tsx      # 保存为模板弹窗
│   ├── ApplyTemplateDialog.tsx       # 应用模板弹窗
│   ├── EditTemplateDialog.tsx        # 编辑模板弹窗
│   ├── Modal.tsx             # 通用弹窗
│   └── Navbar.tsx            # 顶部导航
├── pages/                # 页面组件
│   ├── ActivityList.tsx      # 活动列表页
│   ├── ActivityDetail.tsx    # 活动详情页
│   ├── OnSiteKanban.tsx      # 现场看板
│   ├── OnSiteQuickClaim.tsx  # 快速领取
│   ├── MaterialTemplateLibrary.tsx  # 模板库
│   ├── DataManagement.tsx    # 数据管理（导入导出）
│   ├── ImageLibrary.tsx      # 图片库
│   └── TemplateIndependenceVerification.tsx  # 模板独立性验证页
├── store/                # 状态管理
│   └── useAppStore.ts        # Zustand store
├── types/                # TypeScript 类型定义
│   └── index.ts
├── utils/                # 工具函数
│   └── helpers.ts
├── lib/                  # 通用库
│   └── utils.ts
├── scripts/              # 验证脚本
│   ├── verify-template-independence.mts  # 模板独立性验证
│   └── demo-false-pass-bug.mts           # 假通过问题演示
├── test/                 # 测试配置
│   └── setup.ts
├── App.tsx               # 应用根组件
├── main.tsx              # 应用入口
└── index.css             # 全局样式
```

## 🧭 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 活动列表 | 首页，展示所有活动概览 |
| `/activity/:id` | 活动详情 | 物资管理、领取记录、数据图表 |
| `/activity/:id/kanban` | 现场看板 | 实时展示领取进度和库存 |
| `/activity/:id/quick-claim` | 快速领取 | 现场快速登记领取 |
| `/activity/:id/report` | 活动复盘 | 活动数据复盘报告 |
| `/templates` | 模板库 | 物资模板管理 |
| `/data` | 数据管理 | 导入导出、健康检查 |
| `/images` | 图片库 | 图片资源管理 |
| `/verification` | 模板验证 | 模板独立性可视化验证 |

## 🔧 NPM Scripts

### 开发与构建

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览生产构建产物 |

### 代码质量

| 命令 | 说明 |
|------|------|
| `npm run check` | TypeScript 类型检查（不输出） |
| `npm run lint` | ESLint 代码检查 |
| `npm run test` | 运行单元测试 |
| `npm run test:watch` | 监听模式运行单元测试 |

### 功能验证

| 命令 | 说明 |
|------|------|
| `npm run verify:template` | 模板独立性验证脚本 |
| `npm run verify:false-pass-demo` | 假通过问题演示脚本 |

### 综合检查

| 命令 | 说明 |
|------|------|
| `npm run verify` | 综合验证：类型检查 + Lint + 单元测试 + 模板验证 |
| `npm run validate` | 完整校验：综合验证 + 生产构建 |

**推荐新接手的同学先跑 `npm run verify` 确认所有检查通过。**

## 🧪 验证脚本说明

### 模板独立性验证

```bash
npm run verify:template
```

验证物资模板与活动物资之间的独立性，确保：

1. **正向独立性**：编辑模板不会影响已创建的活动物资
2. **反向独立性**：编辑活动物资不会影响模板
3. **ID 独立性**：模板物资 ID 与活动物资 ID 完全独立，无重用
4. **无假通过**：通过比较次数校验确保每次比较都真实执行

验证脚本会执行 8 个步骤，共进行 48 次字段比较（每项物资 8 个字段 × 3 项物资 × 2 个方向）。

### 假通过问题演示

```bash
npm run verify:false-pass-demo
```

演示 React state 异步更新导致的"假通过"问题，以及如何通过局部变量和比较次数验证来避免该问题。

## 💾 数据存储

所有数据存储在浏览器 LocalStorage 中，Key 为 `cheering-material-storage`。

数据结构包含以下实体：

- **活动** (Activity)：活动基本信息
- **物资** (Item)：活动下的物资条目
- **领取记录** (ClaimRecord)：领取登记记录
- **采购记录** (PurchaseItem)：采购流程记录
- **待办事项** (Todo)：活动准备任务
- **预领取名单** (PreClaimant)：预约领取人员
- **物资模板** (MaterialTemplate)：可复用的物资配置
- **重点物资** (KeyItem)：标记的重点物资 ID 列表

## 📝 数据模型速览

### 物资类型

| 类型标识 | 名称 | 颜色 |
|----------|------|------|
| `lightstick` | 灯牌 | 樱花粉 |
| `banner` | 手幅 | 薰衣草紫 |
| `sticker` | 贴纸 | 薄荷绿 |
| `freepack` | 无料包 | 杏色 |
| `lottery` | 抽选礼物 | 天蓝色 |
| `other` | 其他 | 灰色 |

### 活动状态

| 状态标识 | 名称 |
|----------|------|
| `upcoming` | 即将开始 |
| `ongoing` | 进行中 |
| `completed` | 已结束 |

### 采购状态

| 状态标识 | 名称 |
|----------|------|
| `pending` | 待采购 |
| `ordered` | 已下单 |
| `shipped` | 已发货 |
| `completed` | 已完成 |
| `cancelled` | 已取消 |

## 📄 License

Private
