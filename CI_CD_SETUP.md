# CI/CD Setup Guide for WhatsMyToken

This guide explains how to set up the automated CI/CD pipeline for publishing WhatsMyToken to Chrome Web Store and Firefox Add-ons.

## Overview

The CI/CD pipeline uses:
- **Semantic Release** - Automated versioning based on commit messages
- **GitHub Actions** - CI/CD platform
- **chrome-webstore-upload-cli** - Chrome Web Store publishing
- **web-ext** - Firefox Add-ons publishing

## GitHub Secrets Required

Configure these secrets in your GitHub repository settings:

### Chrome Web Store Secrets

1. **`CHROME_EXTENSION_ID`** - Your extension's ID from Chrome Web Store
   - Find it in Chrome Web Store Developer Dashboard
   - Format: 32 lowercase letters (e.g., `abcdefghijklmnopqrstuvwxyzabcdef`)

2. **`CHROME_CLIENT_ID`** - OAuth2 client ID
3. **`CHROME_CLIENT_SECRET`** - OAuth2 client secret
4. **`CHROME_REFRESH_TOKEN`** - OAuth2 refresh token

To get Chrome OAuth credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Chrome Web Store API
4. Create OAuth2 credentials (Desktop application type)
5. Use the [Chrome Web Store API Guide](https://developer.chrome.com/docs/webstore/using-api) to get refresh token

### Firefox Add-ons Secrets

1. **`FIREFOX_API_KEY`** - API key from addons.mozilla.org
2. **`FIREFOX_API_SECRET`** - API secret from addons.mozilla.org

To get Firefox credentials:
1. Log in to [addons.mozilla.org](https://addons.mozilla.org)
2. Go to Developer Hub > API Keys
3. Generate new credentials

### Optional Secrets

- **`NPM_TOKEN`** - Only needed if publishing to npm (not required for extensions)

## Commit Message Convention

The pipeline uses [Conventional Commits](https://www.conventionalcommits.org/) for automatic versioning:

- `feat:` - New features (minor version bump)
- `fix:` - Bug fixes (patch version bump)
- `feat!:` or `BREAKING CHANGE:` - Breaking changes (major version bump)
- `chore:`, `docs:`, `style:`, `refactor:`, `test:` - No version bump

Examples:
```
feat: add dark mode support
fix: correct token parsing for OAuth2
feat!: change storage format (breaking change)
```

## Workflows

### 1. Release Workflow (`release.yml`)
- **Trigger**: Push to `main` branch
- **Actions**:
  1. Run tests, lint, and type checks
  2. Build extensions for Chrome and Firefox
  3. Create GitHub release with semantic-release
  4. Publish to Chrome Web Store
  5. Publish to Firefox Add-ons

### 2. CI Workflow (`ci.yml`)
- **Trigger**: Pull requests and non-main branches
- **Actions**:
  1. Run tests on multiple Node.js versions
  2. Build extensions
  3. Upload build artifacts

## Local Publishing

You can also publish manually:

```bash
# Chrome Web Store
export CHROME_EXTENSION_ID="your-extension-id"
export CHROME_CLIENT_ID="your-client-id"
export CHROME_CLIENT_SECRET="your-client-secret"
export CHROME_REFRESH_TOKEN="your-refresh-token"
pnpm publish:chrome

# Firefox Add-ons
export FIREFOX_API_KEY="your-api-key"
export FIREFOX_API_SECRET="your-api-secret"
pnpm publish:firefox
```

## First-Time Setup Checklist

1. [ ] Set up Chrome Web Store developer account ($5 one-time fee)
2. [ ] Set up Firefox Add-ons developer account (free)
3. [ ] Create OAuth2 credentials in Google Cloud Console
4. [ ] Generate Firefox API credentials
5. [ ] Add all secrets to GitHub repository settings
6. [ ] Make first manual submission to stores (automated publishing requires initial approval)

## Troubleshooting

### Chrome Web Store
- First submission must be done manually through the dashboard
- After approval, automated updates work immediately
- Check [Chrome Web Store API status](https://status.cloud.google.com/)

### Firefox Add-ons
- Submissions go through automated review (usually < 1 hour)
- Check signing logs in `dist-signed/` directory
- Use `--channel=unlisted` for testing

### Semantic Release
- Ensure commit messages follow convention
- Check `.releaserc.json` for configuration
- View release notes in GitHub Releases tab

## Monitoring

- GitHub Actions tab shows workflow runs
- Release badges can be added to README
- Set up notifications for failed workflows in GitHub settings