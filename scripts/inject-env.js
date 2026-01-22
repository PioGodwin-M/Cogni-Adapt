#!/usr/bin/env node

/**
 * Injects environment variables into the built index.html file
 * This script is optional and won't fail the build if it errors
 */

try {
  const fs = require('fs');
  const path = require('path');
  
  const indexPath = path.join(__dirname, '../dist/index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.log('ℹ️  index.html not found, skipping env injection');
    process.exit(0);
  }
  
  const hfKey = process.env.VITE_HUGGING_FACE_API_KEY || '';
  const gKey = process.env.VITE_GEMINI_API_KEY || '';
  
  let html = fs.readFileSync(indexPath, 'utf8');
  
  const script = `<script>window.__VITE_HUGGING_FACE_API_KEY__="${hfKey}";window.__VITE_GEMINI_API_KEY__="${gKey}";</script>`;
  
  html = html.replace('</head>', script + '</head>');
  fs.writeFileSync(indexPath, html);
  
  console.log('✓ Environment variables injected');
} catch (e) {
  console.log('ℹ️  Env injection skipped (non-critical)');
}

process.exit(0);
