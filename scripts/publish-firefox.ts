#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

const requiredEnvVars = [
  'FIREFOX_API_KEY',
  'FIREFOX_API_SECRET'
];

// Check environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Find the Firefox build directory
const firefoxDistDir = join(process.cwd(), 'dist-firefox');
const distDir = join(process.cwd(), 'dist');

// Check which directory to use
let sourceDir = distDir;
if (existsSync(firefoxDistDir)) {
  sourceDir = firefoxDistDir;
  console.log('📁 Using Firefox-specific build directory');
} else if (!existsSync(distDir)) {
  console.error('❌ Build directory not found. Please run "pnpm build:firefox" first.');
  process.exit(1);
}

console.log('📦 Publishing Firefox extension from:', sourceDir);

try {
  // Sign and publish to Firefox Add-ons
  execSync(
    `npx web-ext sign ` +
    `--source-dir ${sourceDir} ` +
    `--artifacts-dir ${join(process.cwd(), 'dist-signed')} ` +
    `--api-key ${process.env.FIREFOX_API_KEY} ` +
    `--api-secret ${process.env.FIREFOX_API_SECRET}`,
    { 
      stdio: 'inherit',
      env: {
        ...process.env,
        WEB_EXT_API_KEY: process.env.FIREFOX_API_KEY,
        WEB_EXT_API_SECRET: process.env.FIREFOX_API_SECRET
      }
    }
  );

  console.log('✅ Firefox extension signed and published successfully!');
  console.log('📁 Signed extension saved to: dist-signed/');

  // List signed files
  if (existsSync('dist-signed')) {
    const signedFiles = readdirSync('dist-signed');
    console.log('📋 Signed files:', signedFiles.join(', '));
  }
} catch (error) {
  console.error('❌ Failed to publish Firefox extension:', error);
  process.exit(1);
}