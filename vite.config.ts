import { defineConfig } from 'vite';

const hfKey = process.env.VITE_HUGGING_FACE_API_KEY || '';
const gKey = process.env.VITE_GEMINI_API_KEY || '';

console.log('=== VITE BUILD CONFIG ===');
console.log('VITE_HUGGING_FACE_API_KEY available:', !!hfKey);
console.log('VITE_GEMINI_API_KEY available:', !!gKey);

export default defineConfig({
  // Inject environment variables as globals during build
  define: {
    '__VITE_HUGGING_FACE_API_KEY__': JSON.stringify(hfKey),
    '__VITE_GEMINI_API_KEY__': JSON.stringify(gKey),
    // Also try to make them available via import.meta.env fallback
    'import.meta.env.VITE_HUGGING_FACE_API_KEY': JSON.stringify(hfKey),
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(gKey)
  },
  ssr: false
});
