// Get environment variable safely, with multiple fallback approaches
function getEnvVar(key: keyof ImportMetaEnv): string {
  try {
    // Try import.meta.env first (development)
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      const value = import.meta.env[key];
      if (value) return value;
    }
  } catch (e) {
    // ignore
  }

  // Try window globals (injected by Vite define)
  const globalKey = `__${key}__` as const;
  if (typeof window !== 'undefined' && (window as any)[globalKey]) {
    return (window as any)[globalKey];
  }

  return '';
}

export const environment = {
  production: true,
  geminiApiKey: getEnvVar('VITE_GEMINI_API_KEY'),
  huggingFaceApiKey: getEnvVar('VITE_HUGGING_FACE_API_KEY')
};
