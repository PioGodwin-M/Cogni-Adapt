#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../dist/index.html');

// Only proceed if index.html exists
if (!fs.existsSync(indexPath)) {
  process.exit(0);
}

try {
  const hfKey = process.env.VITE_HUGGING_FACE_API_KEY || '';
  const gKey = process.env.VITE_GEMINI_API_KEY || '';
  
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Escape quotes in keys for JavaScript
  const escapedHfKey = hfKey.replace(/"/g, '\\"');
  const escapedGKey = gKey.replace(/"/g, '\\"');
  
  const injection = `<script>window.__VITE_HUGGING_FACE_API_KEY__="${escapedHfKey}";window.__VITE_GEMINI_API_KEY__="${escapedGKey}";</script>`;
  
  html = html.replace('</head>', injection + '</head>');
  fs.writeFileSync(indexPath, html);
} catch (err) {
  // Silent fail - don't break the build
}

process.exit(0);
