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
  
  // Get environment variables - Vercel injects these
  const hfKey = process.env.VITE_HUGGING_FACE_API_KEY;
  const gKey = process.env.VITE_GEMINI_API_KEY;
  
  console.log('=== inject-env.js running ===');
  console.log('VITE_HUGGING_FACE_API_KEY:', hfKey ? 'SET (' + hfKey.length + ' chars)' : 'NOT SET');
  console.log('VITE_GEMINI_API_KEY:', gKey ? 'SET (' + gKey.length + ' chars)' : 'NOT SET');
  
  if (!fs.existsSync(indexPath)) {
    console.warn('⚠ index.html not found at', indexPath);
    process.exit(0); // Don't fail - dist might be in different location
  }
  
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Create injection script with proper escaping
  const scriptInjection = `
    <script>
      (function() {
        try {
          var hfKey = ${JSON.stringify(hfKey || '')};
          var gKey = ${JSON.stringify(gKey || '')};
          
          if (hfKey) {
            window.__VITE_HUGGING_FACE_API_KEY__ = hfKey;
            console.log('✓ HuggingFace API Key injected');
          }
          if (gKey) {
            window.__VITE_GEMINI_API_KEY__ = gKey;
            console.log('✓ Gemini API Key injected');
          }
          
          if (!hfKey && !gKey) {
            console.warn('⚠️ No API keys were available during build');
          }
        } catch(e) {
          console.error('Error in env injection:', e);
        }
      })();
    </script>
  `;
  
  // Find and replace the closing head tag
  if (html.includes('</head>')) {
    html = html.replace('</head>', scriptInjection + '\n  </head>');
    console.log('✓ Injected script into </head>');
  } else if (html.includes('<body>')) {
    html = html.replace('<body>', '<body>' + scriptInjection);
    console.log('✓ Injected script into <body>');
  } else {
    console.warn('⚠ Could not find injection point in HTML');
    process.exit(0);
  }
  
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('✓ Successfully wrote modified index.html');
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error);
  // Don't fail the build
  process.exit(0);
}
