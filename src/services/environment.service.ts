import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  getHuggingFaceApiKey(): string {
    // Use Vite environment variable - configure via .env file
    try {
      const apiKey = (import.meta as any)?.env?.VITE_HUGGING_FACE_API_KEY;
      if (apiKey) {
        return apiKey;
      }
    } catch (e) {
      console.warn('Error accessing import.meta.env:', e);
    }
    return '';
  }
}