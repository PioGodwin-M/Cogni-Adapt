// Get environment variable safely, handling cases where import.meta is undefined
function getEnvVar(key: string): string {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (import.meta.env as any)[key] || '';
    }
  } catch (e) {
    // import.meta not available in production
  }
  return '';
}

export const environment = {
  production: false,
  geminiApiKey: getEnvVar('VITE_GEMINI_API_KEY'),
  huggingFaceApiKey: getEnvVar('VITE_HUGGING_FACE_API_KEY')
};
