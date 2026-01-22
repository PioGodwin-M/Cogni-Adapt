#!/usr/bin/env node

/**
 * Injects environment variables into the built index.html file
 * This script runs after the build to add environment variables
 * Used primarily for Vercel deployments
 */

const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, '../dist/index.html');
  
  // Get environment variables
  const hfKey = process.env.VITE_HUGGING_FACE_API_KEY || '';
  const gKey = process.env.VITE_GEMINI_API_KEY || '';
  
  console.log('Injecting environment variables into index.html...');
  console.log('VITE_HUGGING_FACE_API_KEY available:', !!hfKey);
  console.log('VITE_GEMINI_API_KEY available:', !!gKey);
  
  if (!fs.existsSync(indexPath)) {
    console.warn('⚠ index.html not found at', indexPath);
    console.warn('Build might still be in progress or dist folder not created');
    process.exit(0); // Don't fail the build if HTML doesn't exist yet
  }
  
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Create injection script with proper escaping
  const scriptInjection = `
    <script>
      try {
        window.__VITE_HUGGING_FACE_API_KEY__ = ${JSON.stringify(hfKey)};
        window.__VITE_GEMINI_API_KEY__ = ${JSON.stringify(gKey)};
        if (${!!hfKey} || ${!!gKey}) {
          console.log('✓ Environment variables injected into window object');
        }
      } catch(e) {
        console.error('Error injecting env vars:', e);
      }
    </script>
  `;
  
  // Insert before closing head tag
  if (html.includes('</head>')) {
    html = html.replace('</head>', scriptInjection + '\n  </head>');
  } else {
    console.warn('⚠ Could not find </head> tag, appending to start of body');
    html = html.replace('<body>', '<body>' + scriptInjection);
  }
  
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('✓ Successfully injected environment variables into index.html');
  process.exit(0);
} catch (error) {
  console.error('❌ Error injecting environment variables:', error.message);
  console.error(error);
  process.exit(1);
}
