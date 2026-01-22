import { defineConfig } from 'vite';

export default defineConfig({
  // Inject environment variables as globals during build
  define: {
    '__VITE_HUGGING_FACE_API_KEY__': JSON.stringify(process.env.VITE_HUGGING_FACE_API_KEY || ''),
    '__VITE_GEMINI_API_KEY__': JSON.stringify(process.env.VITE_GEMINI_API_KEY || ''),
    // Also try to make them available via import.meta.env fallback
    'import.meta.env.VITE_HUGGING_FACE_API_KEY': JSON.stringify(process.env.VITE_HUGGING_FACE_API_KEY || ''),
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY || '')
  },
  ssr: false
});
