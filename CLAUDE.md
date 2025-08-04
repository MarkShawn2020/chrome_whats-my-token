# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fast-bearer is a Chrome/Firefox extension that captures Bearer tokens from network requests. Built with React 19, TypeScript 5, Vite 6, and Turborepo, it intercepts HTTP requests containing Bearer authentication tokens and displays them in an organized interface.

## Essential Commands

### Development
```bash
pnpm dev              # Chrome development with HMR
pnpm dev:firefox      # Firefox development with HMR
```

### Build & Production
```bash
pnpm build           # Production build for Chrome
pnpm build:firefox   # Production build for Firefox
pnpm zip             # Build and create zip for distribution
```

### Code Quality
```bash
pnpm lint            # Run ESLint
pnpm lint:fix        # Fix ESLint issues  
pnpm format          # Format with Prettier
pnpm type-check      # TypeScript type checking
```

### Testing
```bash
pnpm e2e             # Run WebdriverIO E2E tests
```

### Utilities
```bash
pnpm clean           # Clean all build artifacts
pnpm module-manager  # Enable/disable extension modules
pnpm update-version <version>  # Update extension version
```

## Architecture Overview

### Monorepo Structure
The project uses Turborepo and pnpm workspaces for managing multiple packages:

- **`/chrome-extension/`**: Core extension configuration, manifest generation, and background scripts
- **`/pages/`**: Individual extension pages (popup, options, content scripts, etc.)
- **`/packages/`**: Shared utilities and configurations
- **`/tests/e2e/`**: End-to-end testing setup with WebdriverIO

### Key Extension Components

1. **Background Service Worker**: `chrome-extension/src/background/`
2. **Content Scripts**: 
   - `pages/content/` - Console scripts
   - `pages/content-ui/` - React components injected into pages
   - `pages/content-runtime/` - Runtime-injected scripts
3. **Extension Pages**:
   - `pages/popup/` - Toolbar popup
   - `pages/options/` - Options page
   - `pages/new-tab/` - Custom new tab
   - `pages/side-panel/` - Chrome 114+ side panel
   - `pages/devtools/` & `pages/devtools-panel/` - DevTools integration

### Shared Packages

- **`packages/shared/`**: Common utilities, hooks, and components
- **`packages/storage/`**: Chrome storage API helpers with TypeScript support
- **`packages/i18n/`**: Type-safe internationalization system
- **`packages/ui/`**: UI components with Tailwind CSS
- **`packages/hmr/`**: Custom hot module reload system
- **`packages/vite-config/`**: Shared Vite configurations
- **`packages/env/`**: Environment variable management

### Development Workflow

1. **Manifest Generation**: The `chrome-extension/manifest.ts` dynamically generates manifest.json based on the target browser
2. **Hot Module Reloading**: Custom HMR plugin enables instant updates during development
3. **Module System**: Use `pnpm module-manager` to enable/disable specific extension features
4. **Build System**: Turborepo orchestrates parallel builds with caching for optimal performance
5. **Code Inspector**: Integrated code-inspector-plugin for quick source code navigation
   - Press `Option + Shift` (Mac) or `Alt + Shift` (Windows/Linux) and click any element
   - Automatically opens the source file in your editor at the exact location
   - Only enabled in development mode

### Code Conventions

- **TypeScript**: Relaxed configuration with shared base in `packages/tsconfig/base.json`
- **React**: Using React 19 with JSX runtime
- **Styling**: Tailwind CSS with shared configuration
- **Linting**: ESLint 9 with relaxed rules for development flexibility
- **Git Hooks**: Husky runs lint-staged on commits

### Environment Variables

- Managed through `packages/env/` package
- `.env` file contains CLI and extension-specific variables
- Different configurations for development vs production builds

### Testing Strategy

- **E2E Testing**: WebdriverIO with Mocha framework
- **Browser Coverage**: Tests run against both Chrome and Firefox builds
- **Test Location**: `/tests/e2e/specs/`
- **Configuration**: Modular WDIO setup in `/tests/e2e/config/`

### Important Notes

- **Manifest V3**: Extension uses Manifest V3 specification
- **Permissions**: Default configuration includes broad permissions - limit these for production
- **Firefox Support**: Separate build process and manifest adjustments for Firefox compatibility
- **Windows Development**: Requires WSL and should run `pnpm dev` as administrator

### Fast-bearer Specific Features

#### Bearer Token Capture
- **Background Service Worker**: Intercepts network requests using `chrome.webRequest` API
- **Token Storage**: Uses Chrome Storage API with deduplication logic
- **Keep-alive Mechanism**: Chrome alarms API prevents service worker idle state

#### UI Components
- **Popup**: Optimized React component with direct storage access (no Suspense)
- **Token Display**: Shows captured tokens with domain, timestamp, and copy functionality
- **shadcn/ui Integration**: Modern UI components with Tailwind CSS theming

#### Known Limitations
- **Code Inspector**: Cannot work in Chrome extension popups due to CSP restrictions
- **Performance**: Popup uses direct storage access to avoid loading delays

### Recent Configuration Changes

1. **ESLint**: Relaxed rules for easier development
2. **TypeScript**: Disabled strict mode checks
3. **shadcn/ui**: Manually integrated with custom CSS variable theming
4. **Content Scripts**: CSS imports removed to fix build errors