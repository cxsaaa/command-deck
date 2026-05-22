# CommandDeck 技术方案

> 版本: v0.1 | 状态: 已实现

## 技术选型

| 层 | 技术 | 理由 |
|----|------|------|
| 桌面运行时 | Tauri 2 | 轻量（~10MB vs Electron ~150MB），原生性能，跨平台 |
| 前端框架 | React 19 + TypeScript 5.8 | 生态成熟，类型安全 |
| 构建工具 | Vite 7 | 快速 HMR，原生 ESM |
| 样式 | Tailwind CSS 4 | CSS-first 配置，与设计 token 无缝集成 |
| UI 状态 | Zustand 5 | 轻量、无 boilerplate、支持 selector 优化 |
| 服务端状态 | TanStack Query 5 | 自动缓存、失效、重试 |
| 数据库 | SQLite（via tauri-plugin-sql） | 本地存储，零配置，跨平台 |
| UI 原语 | Radix UI | 无障碍、无样式、可组合 |
| 图标 | lucide-react | 一致的图标风格 |

## 架构设计

### 分层架构

```
┌─────────────────────────────────────────┐
│  Components (React)                     │  ← 只读 UI + 事件处理
├─────────────────────────────────────────┤
│  Domain (types, search, sorting, etc.)  │  ← 纯业务逻辑，无副作用
├─────────────────────────────────────────┤
│  Repositories (CRUD, query)             │  ← SQL 唯一入口
├─────────────────────────────────────────┤
│  Database (SQLite via Tauri plugin)     │  ← 持久化层
└─────────────────────────────────────────┘
```

**核心约束**: 组件层不直接访问 SQL。所有数据库操作通过 Repository 层封装。

### 数据模型

```
platforms (1) ──→ (N) categories (1) ──→ (N) commands
                                            │
                                            ├── (N) command_tags ──→ tags
                                            ├── (N) command_examples
                                            └── (N) command_parameters
```

**表结构要点**:
- `commands.is_favorite`: boolean，默认 0
- `commands.usage_count`: 整数，复制成功后 +1
- `commands.last_used_at`: ISO 时间戳，复制时更新
- `tags` 通过中间表 `command_tags` 多对多关联
- 外键级联删除：删除命令时自动清理关联的 tags/examples/parameters

### 数据库初始化流程

```
main.tsx bootstrap()
  → initDatabase()
    → Database.load("sqlite:commanddeck.db")   // Tauri 解析到平台数据目录
    → runMigrations(db)                         // 建表
    → seedIfEmpty(db)                           // 首次启动插入种子数据
  → ReactDOM.createRoot().render(<App />)
```

**关键**: `initDatabase()` 在 React 挂载前执行。失败时渲染错误页面，不挂载应用。

### 搜索实现

两阶段搜索：

1. **SQLite LIKE 查询**（粗筛）: 按 title/description/command 模糊匹配，返回候选集
2. **TypeScript 加权排序**（精排）: 多字段加权评分

| 匹配位置 | 权重 |
|----------|------|
| 标题精确匹配 | 100 |
| 标题包含 | 95 |
| 命令包含 | 90 |
| 标签包含 | 70 |
| 分类包含 | 60 |
| 描述包含 | 50 |
| 示例包含 | 40 |
| 参数包含 | 40 |
| 收藏加分 | +20 |
| 最近使用加分 | +10 |
| 使用次数加分 | +10 |

### 状态管理

**Zustand (UI 状态)**:
- `navType`: "all" | "favorites" | "recent" | "platform"
- `currentPlatformId` / `currentCategoryId`: 当前选中
- `searchQuery` / `searchScope`: 搜索状态
- `selectedResultIndex`: 键盘导航索引
- `commandModal` / `deleteConfirmCommandId`: 弹窗状态

**TanStack Query (服务端状态)**:
- `queryKeys.platforms` → platformRepository.listPlatforms()
- `queryKeys.categories(platformId)` → categoryRepository.listCategories()
- `queryKeys.commands(filter)` → commandRepository.listCommands()
- `queryKeys.command(id)` → commandRepository.getCommand()
- 写操作后 `queryClient.invalidateQueries()` 全量刷新

## 跨平台方案

| 关注点 | 实现 |
|--------|------|
| 键盘快捷键 | `e.metaKey \|\| e.ctrlKey` 兼容 Cmd/Ctrl |
| 快捷键标签 | 需平台检测：macOS 显示 ⌘K，其他显示 Ctrl+K |
| 数据库路径 | 相对路径 `sqlite:commanddeck.db`，Tauri 自动解析 |
| 剪贴板 | `@tauri-apps/plugin-clipboard-manager` 抽象 OS 差异 |
| 字体 | system-ui + SF Mono + Cascadia Code 跨平台栈 |
| 窗口状态 | `tauri-plugin-window-state` 记忆位置/尺寸 |

## 插件依赖

| 插件 | 用途 |
|------|------|
| `tauri-plugin-sql` (sqlite) | SQLite 数据库 |
| `tauri-plugin-clipboard-manager` | 系统剪贴板读写 |
| `tauri-plugin-window-state` | 窗口状态持久化 |
| `tauri-plugin-opener` | URL/文件打开 |

## 测试策略

- **单元测试**: domain 层纯函数（search ranking, validation, sorting）
- **Repository 测试**: 迁移、种子、CRUD、级联删除（内存 SQLite）
- **组件测试**: 关键交互组件（Button, SearchInput, CommandCard, MoreMenu, CommandFormModal）
- **工具**: Vitest + jsdom + @testing-library/react
