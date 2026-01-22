#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, '../dist/index.html');
  
  console.log('\n========== ENV INJECTION ==========');
  console.log('Looking for index.html at:', indexPath);
  console.log('File exists:', fs.existsSync(indexPath));
  console.log('VITE_HUGGING_FACE_API_KEY env var:', process.env.VITE_HUGGING_FACE_API_KEY ? 'EXISTS' : 'MISSING');
  console.log('VITE_GEMINI_API_KEY env var:', process.env.VITE_GEMINI_API_KEY ? 'EXISTS' : 'MISSING');
  
  if (!fs.existsSync(indexPath)) {
    console.log('index.html not found');
    process.exit(0);
  }
  
  const hfKey = process.env.VITE_HUGGING_FACE_API_KEY || '';
  const gKey = process.env.VITE_GEMINI_API_KEY || '';
  
  console.log('HF Key length:', hfKey.length);
  console.log('G Key length:', gKey.length);
  
  let html = fs.readFileSync(indexPath, 'utf8');
  console.log('Original HTML size:', html.length);
  
  // Inject into HTML with clear markers
  const injection = `<script>
window.__VITE_HUGGING_FACE_API_KEY__="${hfKey}";
window.__VITE_GEMINI_API_KEY__="${gKey}";
console.log('Env vars injected from build');
</script>`;
  
  const beforeSize = html.length;
  html = html.replace('</head>', injection + '\n</head>');
  
  if (html.length > beforeSize) {
    fs.writeFileSync(indexPath, html);
    console.log('✓ Injection successful, new HTML size:', html.length);
  } else {
    console.log('✗ Injection failed - </head> not found or replacement didn\'t work');
  }
  
  console.log('===================================\n');
} catch (e) {
  console.log('Error:', e.message);
}

process.exit(0);
