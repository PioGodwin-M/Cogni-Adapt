import { defineConfig } from 'vite';

export default defineConfig({
  // Environment variables are automatically exposed to import.meta.env
  // Just ensure they're available in the build environment
  define: {
    'import.meta.env.VITE_HUGGING_FACE_API_KEY': JSON.stringify(process.env.VITE_HUGGING_FACE_API_KEY),
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY)
  },
  ssr: false
});
