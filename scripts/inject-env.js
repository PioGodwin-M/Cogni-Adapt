#!/usr/bin/env node

/**
 * Injects environment variables into the built index.html file
 * This script runs after the build to add environment variables to data attributes
 * Used primarily for Vercel deployments
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../dist/index.html');

// Get environment variables
const hfKey = process.env.VITE_HUGGING_FACE_API_KEY || '';
const gKey = process.env.VITE_GEMINI_API_KEY || '';

console.log('Injecting environment variables into index.html...');
console.log('VITE_HUGGING_FACE_API_KEY available:', !!hfKey);
console.log('VITE_GEMINI_API_KEY available:', !!gKey);

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Add data attributes to html element
  const htmlOpenTag = '<html lang="en">';
  const newHtmlTag = `<html lang="en" data-vite-hugging-face-api-key="${hfKey}" data-vite-gemini-api-key="${gKey}">`;
  
  html = html.replace(htmlOpenTag, newHtmlTag);
  
  // Also inject as inline script for better compatibility
  const scriptInjection = `
    <script>
      window.__VITE_HUGGING_FACE_API_KEY__ = "${hfKey}";
      window.__VITE_GEMINI_API_KEY__ = "${gKey}";
      console.log('✓ Environment variables injected into window object');
    </script>
  `;
  
  // Insert before closing head tag
  html = html.replace('</head>', scriptInjection + '</head>');
  
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('✓ Successfully injected environment variables into index.html');
} else {
  console.warn('⚠ index.html not found at', indexPath);
  console.warn('Make sure to run this script after the build completes');
}
