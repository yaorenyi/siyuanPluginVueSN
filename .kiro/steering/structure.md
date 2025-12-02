---
inclusion: always
---

# Project Structure

## Directory Organization

```
src/
├── features/              # Feature modules (main development area)
│   ├── [featureName]/    # Each feature in its own folder
│   │   ├── index.ts      # Feature registration & entry point
│   │   ├── *Panel.vue    # Main UI component (if applicable)
│   │   ├── storage.ts    # Data persistence (if needed)
│   │   └── types.ts      # Feature-specific types (if needed)
│   └── index.ts          # Central feature exports
├── components/           # Shared Vue components
│   ├── IconWrapper.vue   # Icon component wrapper
│   └── SettingPanel.vue  # Legacy settings panel
├── config/              # Configuration management
│   ├── settings.ts      # Plugin settings & persistence
│   └── icons.ts         # Icon definitions
├── commands/            # Slash commands
│   ├── DateTime.ts      # Date/time commands
│   └── index.ts         # Command registration
├── i18n/               # Internationalization
│   ├── zh_CN.json      # Chinese translations
│   └── en_US.json      # English translations
├── types/              # TypeScript definitions
│   ├── api.d.ts        # API types
│   ├── index.d.ts      # Global types
│   └── vue.d.ts        # Vue augmentations
├── utils/              # Utility functions
│   ├── iconHelper.ts   # Icon utilities
│   └── index.ts        # General utilities
├── index.ts            # Plugin entry point & lifecycle
├── main.ts             # Vue app initialization
├── App.vue             # Root Vue component
├── api.ts              # SiYuan API wrappers
└── index.scss          # Global styles
```

## Key Patterns

### Feature Module Structure

Each feature follows this pattern:

1. **Registration** (`index.ts`): Exports `register[FeatureName]` function
2. **UI Component** (`*Panel.vue`): Main interface (if feature has UI)
3. **Storage** (`storage.ts`): Data persistence using `plugin.loadData/saveData`
4. **Types** (`types.ts`): Feature-specific TypeScript interfaces

### Feature Registration Flow

1. Feature exports registration function from `features/[name]/index.ts`
2. Function imported in `features/index.ts`
3. Called conditionally in `src/index.ts` based on settings
4. Feature toggle managed in Super Panel (`superPanel/SuperPanelView.vue`)

### Settings Management

- **Plugin Settings**: `config/settings.ts` using `plugin.loadData/saveData`
- **Feature Settings**: Individual storage files in feature folders
- **UI Settings**: Some use localStorage for UI-only preferences

### Component Conventions

- Use `<script setup lang="ts">` syntax
- Scoped styles with SCSS: `<style scoped lang="scss">`
- Import SCSS files: `@import "./index.scss"`
- Props typing with `defineProps<{ ... }>()`

### Naming Conventions

- **Files**: camelCase for TS/JS, PascalCase for Vue components
- **Functions**: camelCase (e.g., `registerFeature`)
- **Components**: PascalCase (e.g., `SettingPanel.vue`)
- **Constants**: UPPER_CASE (e.g., `DEFAULT_SETTINGS`)

## Critical Files

- `src/index.ts`: Plugin lifecycle & feature orchestration
- `src/config/settings.ts`: All plugin configuration interfaces
- `src/features/superPanel/`: Central feature management UI
- `plugin.json`: Plugin metadata (version, name, description)
