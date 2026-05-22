# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CommandDeck 是一个桌面端命令速查工具，帮助开发者快速查找、复制和管理常用 CLI 命令。基于 Tauri 2 + React + TypeScript + Vite + SQLite 构建。

## Documentation

| 文档 | 路径 | 说明 |
|------|------|------|
| 设计规范 | [DESIGN.md](./DESIGN.md) | 颜色、间距、圆角、排版等设计 token 与组件规范 |
| 技术方案 | [docs/technical/TECHNICAL_SOLUTION.md](./docs/technical/TECHNICAL_SOLUTION.md) | 架构设计、数据模型、插件选型、跨平台方案 |

### PRD（产品需求文档）

PRD 按版本迭代拆分，一期一个文件：

```
docs/product/
├── PRD-v0.1.md    ← v0.1 基础功能（已完成）
├── PRD-v0.2.md    ← v0.2 下一期待定
└── ...
```

**命名规则**: `PRD-v{主版本}.{迭代版本}.md`

**当前开发版本**: v0.1（已完成），下一期待规划。

> Agent 执行任务时，应先读取 `docs/product/` 目录下最新的 PRD 文件，确认当前迭代的目标和功能范围。

## Tech Stack

- **Runtime**: Tauri 2 (Rust backend, WebView frontend)
- **Frontend**: React 19 + TypeScript 5.8 + Vite 7
- **Styling**: Tailwind CSS 4 (CSS-first config via `@import "tailwindcss"`)
- **State**: Zustand (UI state) + TanStack Query (server state)
- **Database**: SQLite via `@tauri-apps/plugin-sql`
- **UI Primitives**: Radix UI (Dialog, DropdownMenu, Toast)
- **Icons**: lucide-react

## Commands

```bash
npm run dev              # Start Vite dev server only
npm run tauri dev        # Start Tauri + Vite (full desktop app)
npm run build            # TypeScript check + Vite build
npm run tauri build      # Production build (.dmg/.exe/.deb)
npm test                 # Run tests (vitest)
npm run test:watch       # Run tests in watch mode
```

**Note**: First Rust build takes ~18 minutes. Incremental builds are ~3 seconds. Cargo must be in PATH (`source ~/.cargo/env`).

## Architecture

```
src/
├── app/              # providers.tsx (TanStack Query), keyboard.ts (shortcuts)
├── components/
│   ├── command/      # CommandCard, CommandList, CommandFormModal, etc.
│   ├── common/       # Button, Modal, Toast, EmptyState, IconButton, MoreMenu
│   ├── layout/       # AppShell, TopBar, Sidebar
│   ├── platform/     # CategoryTabs
│   └── search/       # SearchInput
├── data/
│   ├── db.ts         # Database singleton + initDatabase()
│   ├── migrations.ts # Schema migrations
│   ├── seed.ts       # Seed data (10 platforms, 37 categories, 46 commands)
│   └── repositories/ # commandRepository, platformRepository, categoryRepository
├── domain/           # types.ts, search.ts, sorting.ts, validation.ts
├── state/            # uiStore.ts (Zustand), queryKeys.ts
└── styles/           # tokens.css (design tokens)
```

### Key Constraints

- **SQL isolation**: SQL only in `src/data/repositories/*` and `src/data/migrations.ts`. Components never access DB directly.
- **Design tokens**: Colors/spacing defined in `tokens.css` as CSS custom properties. Components use `var(--color-*)` or Tailwind utilities, never hardcoded hex.
- **No destructive actions in card main area**: Edit/delete are in the MoreMenu (three-dot menu), not inline on the card.
- **Clipboard-first**: Usage count only increments after successful clipboard write.
- **Bootstrap**: `initDatabase()` runs in `main.tsx` BEFORE React mounts. If it fails, an error page renders via innerHTML.

### Data Flow

```
User action → Component → useMutation/query (TanStack Query)
  → Repository (SQL) → SQLite
  → queryClient.invalidateQueries()
  → UI re-renders
```

### Search

Two-phase: SQLite LIKE query (broad) → TypeScript weighted ranking (precise). Scores: titleExact=100, titleIncludes=95, commandIncludes=90, tagIncludes=70, descriptionIncludes=50, favoriteBonus=20.

## Cross-Platform

Tauri 2 handles platform abstraction. Keyboard shortcuts use `e.metaKey || e.ctrlKey` for Cmd/Ctrl. The `⌘K` label in SearchInput needs platform detection for Windows/Linux (`Ctrl+K`). SQLite path is relative — Tauri resolves to platform data directory automatically.

## Testing

- Unit tests: `src/domain/*.test.ts` (search, validation, sorting)
- Repository tests: `src/data/repositories/*.test.ts` (migration, seed, CRUD)
- Component tests: `*.test.tsx` (Button, SearchInput, CommandCard, etc.)
- Test setup: `src/test/setup.ts`
- Runner: Vitest with jsdom environment
