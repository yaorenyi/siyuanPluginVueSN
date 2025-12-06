# Project Context

## Purpose
This is a SiYuan Note plugin development template built with Vite and Vue 3. The project provides a comprehensive plugin that integrates multiple utility features including table of contents, image compression, document navigation, word query, QR code generation, unit conversion, disk browsing, code image generation, AI content generation, statistics, pronunciation translation, encryption, and video management. It aims to enhance the SiYuan Note user experience by providing frequently used tools and utilities within a single plugin.

## Tech Stack

### Frontend Framework
- **Vue 3.3.8** - Progressive JavaScript framework for building UI components
- **TypeScript 5.0.4** - Type-safe JavaScript superset
- **Sass 1.62.1** - CSS preprocessor for styling

### Build Tools
- **Vite 6.2.1** - Fast build tool and development server
- **@vitejs/plugin-vue** - Vue plugin for Vite
- **vite-plugin-static-copy** - Static asset copying plugin
- **vite-plugin-zip-pack** - Plugin packaging

### Code Quality
- **ESLint 9.22.0** - JavaScript and TypeScript linting
- **@antfu/eslint-config** - Opinionated ESLint config by Anthony Fu
- **eslint-plugin-perfectionist** - Plugin for sorting object keys, imports, etc
- **eslint-plugin-format** - Formatting plugin

### SiYuan Integration
- **siyuan 1.1.0** - SiYuan Note plugin SDK

### UI Components
- **@iconify/vue 5.0.0** - Icon component library

### Utilities
- **browser-image-compression** - Image compression in browser
- **html2canvas** - Screenshot/DOM capture
- **marked** - Markdown parser
- **qrcode** - QR code generation
- **highlight.js** - Syntax highlighting
- **video.js** - HTML5 video player

### Development Tools
- **ts-node** - TypeScript execution environment
- **fast-glob** - Fast glob pattern matching
- **minimist** - Argument parser

## Project Conventions

### Code Style
- **Indentation**: 2 spaces (configured in ESLint)
- **Quotes**: Single quotes for strings
- **Naming Conventions**:
  - Files: camelCase (e.g., `myFeature.ts`)
  - Vue Components: PascalCase (e.g., `SettingPanel.vue`)
  - Functions/Variables: camelCase (e.g., `registerFeature`)
  - Constants: UPPER_CASE (e.g., `DEFAULT_SETTINGS`)
- **TypeScript**: Strict mode disabled, but with no unused locals/parameters checks
- **Vue 3 Composition API**: Use `<script setup>` syntax with TypeScript
- **SCSS**: Modular SCSS files imported per component

### Architecture Patterns

#### Modular Feature Architecture
- Each feature resides in `src/features/[featureName]/` as an independent module
- Features are registered dynamically based on configuration settings
- Each feature exports a `register[FeatureName]` function

#### Configuration Management
- Centralized settings in `src/config/settings.ts`
- Settings persisted using SiYuan's `plugin.loadData()` and `plugin.saveData()`
- Type-safe configuration interfaces

#### Internationalization
- JSON-based language files in `src/i18n/`
- Supports Chinese (zh_CN) and English (en_US)
- Access via `plugin.i18n.featureName.key`

### Testing Strategy
- Currently no formal testing framework is implemented
- Manual testing through SiYuan Note client
- Development mode supports hot reload for iterative testing

### Git Workflow
- **Branching**: Main development on main branch
- **Commit Convention**: Commits should be descriptive and in Chinese or English
- **Release Process**: Automated version bumping using semantic versioning
- **Tagging**: Git tags created automatically for releases

## Domain Context

### SiYuan Note Plugin System
- Plugins extend SiYuan Note functionality through a defined API
- Plugins run in both desktop and mobile environments
- Access to SiYuan's block-based document structure
- Integration with SiYuan's menu system and UI

### Block-based Architecture
- SiYuan uses a block-based content structure (blocks, documents, notebooks)
- Each block has a unique ID and can be independently manipulated
- Plugin hooks allow reacting to block events and modifications

### Feature Modules Overview
1. **Page Lock** - Encrypt and lock specific pages
2. **Table of Contents** - Generate document TOC
3. **Image Compressor** - Compress images within documents
4. **Doc Navigation** - Hierarchical document navigation
5. **Shortcut Manager** - Custom shortcut keys
6. **Word Query** - Dictionary lookup with translation
7. **QR Code Generator** - Generate QR codes from text
8. **Unit Converter** - Convert between different units
9. **Disk Browser** - Browse local filesystem
10. **Code Image Generator** - Convert code to styled images
11. **AI Content Generator** - Generate content using AI APIs
12. **Statistics** - Document and workspace statistics
13. **Pronunciation** - Text to pronunciation translation
14. **Encryption** - Encrypt/decrypt text content
15. **Video Manager** - Manage and categorize videos

## Important Constraints

### SiYuan Version Requirements
- **Minimum App Version**: 2.10.14
- Plugin must be compatible with all SiYuan platforms (desktop, mobile, browser)

### Performance Constraints
- Large features must have toggle switches in SuperPanel
- AI API configurations centralized for efficiency
- Lazy loading recommended for heavy components

### Security Considerations
- No direct file system access beyond SiYuan's sandbox
- Sensitive data (API keys) stored in plugin settings, not code
- User input validation for all external API interactions

### Compatibility
- Must work across all SiYuan frontends (desktop, mobile, web)
- Graceful degradation when features are disabled
- Backward compatibility with older plugin versions

## External Dependencies

### AI API Providers
- **Tongyi (通义千问)** - Alibaba's AI model
- **OpenAI** - GPT models
- **DeepSeek** - DeepSeek AI models
- **Custom Endpoints** - User-defined API endpoints

### Data Persistence
- SiYuan's built-in plugin data storage
- No external databases or storage services

### File System Access
- Limited to SiYuan's designated directories
- Video files and images accessed through SiYuan's file API
