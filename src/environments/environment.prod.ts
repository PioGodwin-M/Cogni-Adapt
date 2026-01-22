// Get environment variable safely, with multiple fallback approaches
function getEnvVar(key: 'VITE_GEMINI_API_KEY' | 'VITE_HUGGING_FACE_API_KEY'): string {
  // First, try window globals (injected by Vite define or Vercel)
  const globalKey = `__${key}__`;
  if (typeof window !== 'undefined' && (window as any)[globalKey]) {
    console.log(`Found ${key} in window globals`);
    return (window as any)[globalKey];
  }

  // Try import.meta.env (fallback for some build systems)
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      const value = (import.meta as any).env[key];
      if (value) {
        console.log(`Found ${key} in import.meta.env`);
        return value;
      }
    }
  } catch (e) {
    // ignore
  }

  console.warn(`${key} not found in any configuration source`);
  return '';
}

export const environment = {
  production: true,
  geminiApiKey: getEnvVar('VITE_GEMINI_API_KEY'),
  huggingFaceApiKey: getEnvVar('VITE_HUGGING_FACE_API_KEY')
};
