import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  getHuggingFaceApiKey(): string {
    // Use Vite environment variable - configure via .env file
    return import.meta.env.VITE_HUGGING_FACE_API_KEY || '';
  }
}