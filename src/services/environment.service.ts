import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  constructor() {
    console.log('EnvironmentService initialized');
    console.log('Environment production:', environment.production);
    console.log('Hugging Face API Key available:', !!environment.huggingFaceApiKey);
  }

  getHuggingFaceApiKey(): string {
    const apiKey = environment.huggingFaceApiKey;
    if (apiKey && apiKey.length > 0) {
      console.log('EnvironmentService - API Key found (length:', apiKey.length + ')');
      return apiKey;
    }
    console.warn('EnvironmentService - Hugging Face API Key is missing. Make sure VITE_HUGGING_FACE_API_KEY is set in environment variables.');
    return '';
  }
}