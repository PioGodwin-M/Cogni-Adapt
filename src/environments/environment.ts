export const environment = {
  production: false,
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  huggingFaceApiKey: import.meta.env.VITE_HUGGING_FACE_API_KEY || ''
};
