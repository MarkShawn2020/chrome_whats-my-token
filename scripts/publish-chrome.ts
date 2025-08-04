#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

const requiredEnvVars = [
  'CHROME_EXTENSION_ID',
  'CHROME_CLIENT_ID',
  'CHROME_CLIENT_SECRET',
  'CHROME_REFRESH_TOKEN'
];

// Check environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Find the latest Chrome extension zip
const distDir = join(process.cwd(), 'dist');
if (!existsSync(distDir)) {
  console.error('❌ dist directory not found. Please run "pnpm build && pnpm zip" first.');
  process.exit(1);
}

const files = readdirSync(distDir);
const chromeZip = files.find(f => f.endsWith('.zip') && !f.includes('firefox'));

if (!chromeZip) {
  console.error('❌ Chrome extension zip not found in dist directory.');
  process.exit(1);
}

console.log('📦 Publishing Chrome extension:', chromeZip);

try {
  // Upload to Chrome Web Store
  execSync(
    `npx chrome-webstore-upload-cli upload ` +
    `--source ${join(distDir, chromeZip)} ` +
    `--extension-id ${process.env.CHROME_EXTENSION_ID}`,
    { 
      stdio: 'inherit',
      env: {
        ...process.env,
        EXTENSION_ID: process.env.CHROME_EXTENSION_ID,
        CLIENT_ID: process.env.CHROME_CLIENT_ID,
        CLIENT_SECRET: process.env.CHROME_CLIENT_SECRET,
        REFRESH_TOKEN: process.env.CHROME_REFRESH_TOKEN
      }
    }
  );

  console.log('✅ Chrome extension uploaded successfully!');

  // Optionally publish (requires manual review for first submission)
  const shouldPublish = process.argv.includes('--publish');
  if (shouldPublish) {
    console.log('🚀 Publishing Chrome extension...');
    execSync(
      `npx chrome-webstore-upload-cli publish ` +
      `--extension-id ${process.env.CHROME_EXTENSION_ID}`,
      { 
        stdio: 'inherit',
        env: {
          ...process.env,
          EXTENSION_ID: process.env.CHROME_EXTENSION_ID,
          CLIENT_ID: process.env.CHROME_CLIENT_ID,
          CLIENT_SECRET: process.env.CHROME_CLIENT_SECRET,
          REFRESH_TOKEN: process.env.CHROME_REFRESH_TOKEN
        }
      }
    );
    console.log('✅ Chrome extension published successfully!');
  } else {
    console.log('ℹ️  Extension uploaded but not published. Use --publish flag to publish.');
  }
} catch (error) {
  console.error('❌ Failed to publish Chrome extension:', error);
  process.exit(1);
}