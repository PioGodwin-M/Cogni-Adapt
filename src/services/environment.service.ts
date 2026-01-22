import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  getHuggingFaceApiKey(): string {
    const apiKey = environment.huggingFaceApiKey;
    console.log('EnvironmentService - Hugging Face API Key from environment:', apiKey ? 'PRESENT' : 'MISSING');
    console.log('EnvironmentService - API Key length:', apiKey?.length || 0);
    if (apiKey && apiKey.length > 0) {
      console.log('EnvironmentService - API Key found:', apiKey.substring(0, 10) + '...');
      return apiKey;
    }
    console.warn('EnvironmentService - Hugging Face API Key is missing from environment file');
    return '';
  }
}