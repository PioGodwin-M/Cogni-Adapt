import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CognitiveProfile, TransformedContent } from '../models/types';
import { EnvironmentService } from './environment.service';
import { InferenceClient } from "@huggingface/inference";


@Injectable({ providedIn: 'root' })
export class CogniAdaptService {
  private readonly router = new Router();
  private readonly envService = inject(EnvironmentService);
  private hf: InferenceClient;
  private chatHistory: { role: string; content: string }[] = [];

  // State Signals
  selectedProfile = signal<CognitiveProfile | null>(null);
  inputText = signal<string>('');
  transformedContent = signal<TransformedContent | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor() {
    const apiKey = this.envService.getHuggingFaceApiKey();
    if (!apiKey || apiKey === 'hf_placeholder_key') {
      console.warn('Hugging Face API Key is missing or is a placeholder. Please set it in EnvironmentService.');
    }

    // Initialize InferenceClient with a custom fetch to handle proxying
    // We avoid using 'endpointUrl' directly because it conflicts with passing a 'model' argument
    this.hf = new InferenceClient(apiKey, {
      fetch: (url, init) => {
        // Rewrite the URL to use our local proxy
        // Handle both router and api-inference domains, and optional /hf path
        const urlStr = url.toString();
        const newUrl = urlStr.replace(/^https?:\/\/(?:router|api-inference)\.huggingface\.co(?:\/hf)?/, '/api/hf');
        return fetch(newUrl, init);
      }
    });

    this.loadProfileFromStorage();
  }

  private loadProfileFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      const savedProfile = localStorage.getItem('cognitiveProfile') as CognitiveProfile;
      const validProfiles: CognitiveProfile[] = ['ADHD', 'Dyslexia', 'Visual', 'Auditory', 'Kinesthetic', 'Autism'];
      if (savedProfile && validProfiles.includes(savedProfile)) {
        this.selectedProfile.set(savedProfile);
      }
    }
  }

  selectProfile(profile: CognitiveProfile): void {
    this.selectedProfile.set(profile);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cognitiveProfile', profile);
    }
    this.router.navigate(['/input']);
  }

  async transformText(text: string): Promise<void> {
    const profile = this.selectedProfile();
    if (!profile || !text) {
      this.error.set('Profile or text is missing.');
      return;
    }

    this.inputText.set(text);
    this.isLoading.set(true);
    this.error.set(null);
    this.transformedContent.set(null);

    try {
      const apiKey = this.envService.getHuggingFaceApiKey();

      const prompt = this.getPromptForProfile(profile, text);
      // const schema = this.getSchemaForProfile(profile); // Schema not directly used in HF API call like Gemini

      const systemPrompt = "You are an AI assistant specialized in adapting educational content for neurodiverse learners. Output ONLY valid JSON.";

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ];

      const responseText = await this.callHuggingFaceApi(messages);

      // Extract JSON from response if it contains markdown code blocks
      let jsonString = responseText.trim();
      const jsonMatch = jsonString.match(/```json\n([\s\S]*?)\n```/) || jsonString.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }

      const result = JSON.parse(jsonString) as Omit<TransformedContent, 'profile'>;
      this.transformedContent.set({ ...result, profile });
      this.router.navigate(['/output']);
    } catch (e: any) {
      console.error('Error transforming text:', e);
      const errorMessage = e?.message || 'Failed to transform content. Please check your API key and try again.';
      this.error.set(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async callHuggingFaceApi(messages: { role: string; content: string }[]): Promise<string> {
    try {
      const completion = await this.hf.chatCompletion({
        model: "Qwen/Qwen2.5-72B-Instruct",
        messages: messages as any, // Cast to any to avoid strict type issues with role string
        max_tokens: 1000, // Matching user's example
        temperature: 0.7
      });

      if (completion.choices && completion.choices.length > 0 && completion.choices[0].message) {
        let content = completion.choices[0].message.content || '';
        // Apply cleanup as per user's example
        return content.replace(/\*/g, "").trim();
      }
      return '';
    } catch (e: any) {
      console.error('Hugging Face SDK Error:', e);
      throw new Error(`Hugging Face SDK Error: ${e.message}`);
    }
  }

  initializeChat(): void {
    // Reset chat history
    this.chatHistory = [
      { role: "system", content: 'You are Cogni-Chat, a friendly and helpful AI assistant for the Cogni-Adapt application. Your goal is to help users understand complex topics by providing clear, concise, and accessible explanations. Avoid jargon and be encouraging.' }
    ];
  }

  async *sendMessageStream(message: string): AsyncGenerator<string> {
    if (this.chatHistory.length === 0) {
      this.initializeChat();
    }

    this.error.set(null);
    this.chatHistory.push({ role: "user", content: message });

    try {
      // Construct prompt from history
      // const prompt = this.chatHistory.map(msg => `${msg.role}: ${msg.content}`).join("\n") + "\nassistant:";

      const responseText = await this.callHuggingFaceApi(this.chatHistory);
      this.chatHistory.push({ role: "assistant", content: responseText });

      // Yield the whole text at once since streaming is not easily supported with simple fetch here without more complex handling
      yield responseText;

    } catch (e) {
      console.error('Error sending message:', e);
      this.error.set('Failed to get a response from the chatbot. Please try again.');
      yield 'Sorry, I encountered an error. Please try again.';
    }
  }

  // Multimodal methods are not supported by Qwen/Qwen2.5-72B-Instruct (Text-only)

  async analyzeImage(prompt: string, imageFile: File): Promise<string> {
    this.error.set('Image analysis is not supported with the current model.');
    return "Image analysis is not supported with the current model (Qwen/Qwen2.5-72B-Instruct).";
  }

  async transcribeAudio(audioFile: File): Promise<string> {
    this.error.set('Audio transcription is not supported with the current model.');
    return "Audio transcription is not supported with the current model (Qwen/Qwen2.5-72B-Instruct).";
  }

  async generateImage(prompt: string, aspectRatio: string): Promise<string> {
    this.error.set('Image generation is not supported with the current model.');
    return "";
  }

  async *animateImage(prompt: string, imageFile: File, aspectRatio: '16:9' | '9:16'): AsyncGenerator<{ status: string; videoUrl?: string }> {
    this.error.set('Image animation is not supported with the current model.');
    yield { status: 'Error: Not supported' };
  }

  async analyzeVideo(prompt: string, videoFile: File): Promise<string> {
    this.error.set('Video analysis is not supported with the current model.');
    return "Video analysis is not supported with the current model (Qwen/Qwen2.5-72B-Instruct).";
  }

  private getPromptForProfile(profile: CognitiveProfile, text: string): string {
    const baseInstruction = `You are an AI assistant specialized in adapting educational content for neurodiverse learners. Your task is to transform the provided text for a user with the selected profile. The output must be a valid JSON object that strictly adheres to the provided schema. Do not include any markdown formatting (like \`\`\`json) in the JSON output.`;

    let profileSpecificInstruction = '';
    switch (profile) {
      case 'ADHD':
        profileSpecificInstruction = `
          Profile: ADHD - "Focus Flow"
          Transform the text with:
          - STRUCTURE: Use a maximum of 2 sentences per bullet point. Group into "chunks" of 3-5 bullets.
          - ENGAGEMENT: Start each concept with a relevant emoji as a visual anchor. Bold **key terms** using markdown.
          - FOCUS AIDS: Include "Why This Matters" or "Quick Win" micro-sections where appropriate.
          
          JSON Requirements:
          - The 'summary' should be short, energetic, and highly engaging.
          - The 'concepts' array must contain strings. Each string is a concise bullet point.
        `;
        break;
      case 'Dyslexia':
        profileSpecificInstruction = `
          Profile: Dyslexia - "Clear Path"
          Transform the text with:
          - TYPOGRAPHY: Ensure one main idea per line or short paragraph. Use extra spacing for visual breathing room.
          - VOCABULARY: Use short sentences (max 15 words) and active voice. Replace complex words with simpler alternatives. Define technical terms immediately in parentheses.
          
          JSON Requirements:
          - The 'summary' should be simple, direct, and easy to read.
          - The 'concepts' array must contain strings. Each string is a short, easily digestible paragraph.
        `;
        break;
      case 'Visual':
        profileSpecificInstruction = `
          Profile: Visual - "Picture Perfect"
          Transform the text by breaking it into core concepts and suggesting visuals for each.
          - VISUAL DESCRIPTIONS: For each concept, describe a helpful visual like a diagram, chart, illustration, or mind map.
          - STRUCTURE: Focus on hierarchy and spatial relationships.
          
          JSON Requirements:
          - The 'summary' should provide a high-level overview.
          - The 'concepts' array must contain objects, each with 'title', 'description', and a creative 'visualIdea' for a helpful diagram, icon, or illustration.
        `;
        break;
      case 'Auditory':
        profileSpecificInstruction = `
          Profile: Auditory - "Sound Learning"
          Transform the text for an auditory learner with:
          - RHYTHM: Write in natural, conversational speaking patterns.
          - ENGAGEMENT: Include verbal mnemonics, rhymes, or acronyms to aid memory. Add "say this out loud" prompts.
          - STRUCTURE: Use a conversational tone, like a podcast script.
          
          JSON Requirements:
          - The 'summary' should be like a podcast intro.
          - The 'concepts' array must contain strings. Use special prefixes for certain concepts: '[Mnemonic]:' for memory aids, '[Say Aloud]:' for verbal prompts.
        `;
        break;
      case 'Kinesthetic':
        profileSpecificInstruction = `
          Profile: Kinesthetic - "Learn by Doing"
          Transform the text for a kinesthetic learner with:
          - ACTIVITIES: For each main concept, suggest a simple, hands-on activity or a real-world application challenge.
          - INTERACTION: Frame concepts as problems to solve or things to build.
          - ENGAGEMENT: Use active, command-oriented language.
          
          JSON Requirements:
          - The 'summary' should set up a challenge or goal.
          - The 'concepts' array must contain strings. Use special prefixes: '[Activity]:' for hands-on tasks, and '[Challenge]:' for real-world application problems.
        `;
        break;
      case 'Autism':
        profileSpecificInstruction = `
          Profile: Autism - "Structured Clarity"
          Transform the text for a learner who thrives on structure and clarity:
          - PREDICTABILITY: Use consistent formatting. No ambiguous language, idioms, or metaphors. Be literal and precise.
          - DETAIL: Break down all processes into logical, numbered, step-by-step instructions.
          - SENSORY: Keep the language direct and unadorned. Focus on facts and patterns.
          
          JSON Requirements:
          - The 'summary' must state the topic and the key takeaways very clearly.
          - The 'concepts' array must contain strings. Each string should be a literal, precise, and logical statement or a step in a process.
        `;
        break;
    }

    const quizInstruction = "The 'questions' array must contain 3-5 multiple-choice questions based on the key concepts in the text. Each question object must have 'question', 'options' (an array of 4 strings), 'correctAnswer' (one of the options), and a brief 'explanation'.";

    return `${baseInstruction}\n${profileSpecificInstruction}\n${quizInstruction}\n\nHere is the text to transform:\n\n${text}`;
  }


}