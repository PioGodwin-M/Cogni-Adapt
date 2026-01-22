import { defineConfig } from 'vite';

export default defineConfig({
  // Define environment variables for use in the application
  define: {
    '__VITE_HUGGING_FACE_API_KEY__': JSON.stringify(process.env.VITE_HUGGING_FACE_API_KEY || ''),
    '__VITE_GEMINI_API_KEY__': JSON.stringify(process.env.VITE_GEMINI_API_KEY || '')
  },
  // Vite automatically exposes VITE_* environment variables to import.meta.env
  // This works when using ng serve with Vite backend
  ssr: false
});
