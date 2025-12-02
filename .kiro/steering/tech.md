---
inclusion: always
---

# Technology Stack

## Core Technologies

- **Framework**: Vue 3.3.8 (Composition API with `<script setup>`)
- **Language**: TypeScript 5.0.4 (strict mode disabled, but type-safe practices encouraged)
- **Build Tool**: Vite 6.2.1
- **Styling**: Sass 1.62.1 (SCSS syntax)
- **SDK**: siyuan 1.1.0 (official plugin SDK)

## Key Libraries

- **@iconify/vue**: Icon system (preferred over custom icons)
- **browser-image-compression**: Image compression
- **qrcode**: QR code generation
- **marked**: Markdown parsing
- **html2canvas**: Screenshot/image generation
- **highlight.js**: Code syntax highlighting

## Development Tools

- **ESLint**: Code linting with @antfu/eslint-config
- **Package Manager**: pnpm (preferred)
- **Module System**: ESNext modules

## Common Commands

```bash
# Development (watch mode with hot reload)
pnpm dev

# Production build
pnpm build

# Version release
pnpm release:patch   # 0.0.1 -> 0.0.2
pnpm release:minor   # 0.0.1 -> 0.1.0
pnpm release:major   # 0.0.1 -> 1.0.0
```

## Build Configuration

- **Output**: CommonJS format (`formats: ["cjs"]`)
- **Entry**: `src/index.ts`
- **Dev Mode**: Builds to SiYuan workspace path (set in `.env`)
- **Prod Mode**: Builds to `./dist` and creates `package.zip`
- **Externals**: `siyuan`, `process` (not bundled)

## Environment Setup

Create `.env` file:
```env
VITE_SIYUAN_WORKSPACE_PATH=C:/Users/YourName/AppData/Roaming/SiYuan
```

## API Integration

Uses SiYuan's `fetchSyncPost` for all API calls. Common patterns in `src/api.ts`.
