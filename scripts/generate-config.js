#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Read environment variables
const config = {
  huggingFaceApiKey: process.env.VITE_HUGGING_FACE_API_KEY || '',
  geminiApiKey: process.env.VITE_GEMINI_API_KEY || '',
};

// Write config as JSON
const configPath = path.join(distDir, 'config.json');
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

process.exit(0);
