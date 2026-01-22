// Configuration for API keys and environment variables
// This file handles environment variable access for both development and production

// Try to detect environment variables from various sources
function getEnvVar(varName: string): string {
  // Try import.meta.env first (Vite)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const val = (import.meta as any).env[varName];
    if (val && val !== 'undefined') {
      return val;
    }
  }
  
  // Try window scope
  if (typeof window !== 'undefined') {
    const val = (window as any)[`__${varName}__`];
    if (val && val !== 'undefined') {
      return val;
    }
  }
  
  return '';
}

export const config = {
  get huggingFaceApiKey(): string {
    return getEnvVar('VITE_HUGGING_FACE_API_KEY');
  },
  
  get geminiApiKey(): string {
    return getEnvVar('VITE_GEMINI_API_KEY');
  }
};
