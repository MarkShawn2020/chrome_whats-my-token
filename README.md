# WhatsMyToken

[简体中文](./README.zh.md) | English

A browser extension that captures and inspects authentication tokens from network requests. Built with React 19, TypeScript 5, Vite 6, and Turborepo.

![](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![](https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![](https://badges.aleen42.com/src/vitejs.svg)
![](https://img.shields.io/badge/Chrome-4285F4?style=flat-square&logo=google-chrome&logoColor=white)
![](https://img.shields.io/badge/Firefox-FF7139?style=flat-square&logo=firefox&logoColor=white)

## Features

- 🔍 **Real-time Token Capture**: Automatically captures Bearer tokens from all network requests
- 📊 **Multi-level Filtering**: Filter tokens by current domain, root domain (*.example.com), or view all
- 🗂️ **Dual View Modes**: 
  - **Requests Tab**: Chronological list of all requests with Bearer token highlighting
  - **Tokens Tab**: Grouped view by unique tokens with expandable request details
- 🎯 **Smart Domain Detection**: Intelligently extracts root domains with support for complex TLDs
- 📋 **One-click Copy**: Easily copy tokens to clipboard
- 🌓 **Dark/Light Mode**: Automatic theme detection based on system preferences
- 🔄 **Live Updates**: Real-time updates as new tokens are captured
- 🧹 **Token Management**: Clear all tokens with one click

## Installation

### Development

1. Clone this repository
   ```bash
   git clone https://github.com/yourusername/whatsmytoken.git
   cd whatsmytoken
   ```

2. Install dependencies
   ```bash
   npm install -g pnpm
   pnpm install
   ```

3. Start development server
   ```bash
   # For Chrome
   pnpm dev

   # For Firefox
   pnpm dev:firefox
   ```

4. Load the extension
   - **Chrome**: 
     1. Open `chrome://extensions`
     2. Enable "Developer mode"
     3. Click "Load unpacked"
     4. Select the `dist` directory
   
   - **Firefox**: 
     1. Open `about:debugging`
     2. Click "This Firefox"
     3. Click "Load Temporary Add-on"
     4. Select `dist/manifest.json`

### Production Build

```bash
# For Chrome
pnpm build

# For Firefox
pnpm build:firefox

# Create distribution zip
pnpm zip
```

## Usage

1. **Install the extension** in your browser
2. **Navigate to any website** that uses Bearer token authentication
3. **Click the extension icon** in your toolbar to open the popup
4. **View captured tokens** in two ways:
   - **Requests tab**: See all requests chronologically with Bearer tokens highlighted
   - **Tokens tab**: View unique tokens grouped together with expandable request details
5. **Filter tokens** by:
   - Current domain only
   - Root domain and all subdomains (*.example.com)
   - All domains
6. **Copy tokens** with a single click on the "Copy" button

## Development

### Project Structure

```
whatsmytoken/
├── chrome-extension/     # Extension manifest and background scripts
├── pages/               # Extension pages and content scripts
│   ├── popup/          # Main popup UI
│   ├── content/        # Content scripts for token interception
│   ├── options/        # Options page (if needed)
│   └── ...
├── packages/           # Shared packages
│   ├── storage/        # Chrome storage API helpers
│   ├── ui/            # Shared UI components
│   ├── i18n/          # Internationalization
│   └── ...
└── dist/              # Built extension files
```

### Available Commands

```bash
# Development
pnpm dev              # Chrome development with HMR
pnpm dev:firefox      # Firefox development with HMR

# Building
pnpm build           # Production build for Chrome
pnpm build:firefox   # Production build for Firefox
pnpm zip            # Create distribution zip

# Code Quality
pnpm lint           # Run ESLint
pnpm lint:fix       # Fix ESLint issues
pnpm type-check     # TypeScript type checking
pnpm format         # Format with Prettier

# Testing
pnpm e2e            # Run E2E tests

# Utilities
pnpm clean          # Clean all build artifacts
pnpm update-version # Update extension version
```

### Key Technologies

- **React 19** - UI framework
- **TypeScript 5** - Type safety
- **Vite 6** - Build tool with HMR support
- **Turborepo** - Monorepo management
- **Tailwind CSS** - Styling
- **Chrome Extension Manifest V3** - Modern extension APIs
- **WebdriverIO** - E2E testing

## How It Works

1. **Content Script Injection**: WhatsMyToken injects a content script into all web pages
2. **Request Interception**: The script overrides `fetch` and `XMLHttpRequest` to intercept all network requests
3. **Token Extraction**: Authorization headers are parsed to extract Bearer tokens
4. **Background Service**: Captured tokens are sent to the background service worker
5. **Storage**: Tokens are stored using Chrome's storage API with details like domain, URL, method, and timestamp
6. **UI Updates**: The popup UI subscribes to storage changes for real-time updates

## Privacy & Security

- WhatsMyToken runs entirely locally in your browser
- No data is sent to external servers
- All captured tokens are stored locally using Chrome's storage API
- Tokens are only accessible through the extension popup
- Clear all data anytime with the "Clear All" button

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built on top of the excellent [chrome-extension-boilerplate-react-vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite) by Jonghakseo.