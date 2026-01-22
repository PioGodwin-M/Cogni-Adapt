// Production environment configuration
// Environment variables are injected by scripts/inject-env.js or Vercel build process
function getEnvVar(key: 'VITE_GEMINI_API_KEY' | 'VITE_HUGGING_FACE_API_KEY'): string {
  // Check window globals first (injected by inject-env.js)
  const globalKey = `__${key}__`;
  if (typeof window !== 'undefined' && (window as any)[globalKey]) {
    console.log(`✓ ${key} found in window.${globalKey}`);
    return (window as any)[globalKey];
  }
  
  // Try import.meta.env
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) {
      const value = (import.meta as any).env[key];
      if (value) {
        console.log(`✓ ${key} found in import.meta.env`);
        return value;
      }
    }
  } catch (e) {
    // ignore
  }

  console.warn(`⚠️ ${key} not found. Please set it in Vercel Environment Variables.`);
  console.warn(`   Go to: Vercel Dashboard → Project Settings → Environment Variables`);
  console.warn(`   Add: ${key} = your_api_key`);
  
  return '';
}

export const environment = {
  production: true,
  geminiApiKey: getEnvVar('VITE_GEMINI_API_KEY'),
  huggingFaceApiKey: getEnvVar('VITE_HUGGING_FACE_API_KEY')
};
