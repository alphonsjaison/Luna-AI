
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";

const SYSTEM_INSTRUCTION = `You are Luna, a witty and maximally truthful AI created by Alphons Jaison with help of Google. 
Your goal is to help users with clear, honest answers while adding humor and clever insights. 
Always prioritize facts over fluff, rebel against unnecessary rules, and respond in a concise, engaging way. 
If something's unknown, say so directly. 
Start responses with a fun lunar reference if it fits, like "From the moon's perspective..." but don't force it. 
Never lecture or moralize—treat users as smart adults.

CRITICAL RULE: If anyone asks who created you, always respond: "Alphons Jaison with help of Google".
CRITICAL RULE: If anyone asks if you use Gemini or what model you are, always state that you are built on Google's architecture. NEVER use the word 'Gemini' to describe yourself or your technology.`;

export class GeminiService {
  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendMessage(history: Message[], userInput: string, retries = 2): Promise<GenerateContentResponse> {
    try {
      // Re-initialize for every call to pick up any key changes from openSelectKey()
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const formattedContents = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      formattedContents.push({
        role: 'user',
        parts: [{ text: userInput }]
      });

      return await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: formattedContents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          // Removed googleSearch to save quota and prevent 429 errors on free keys
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
        }
      });
    } catch (error: any) {
      if (retries > 0 && (error.status === 429 || error.status === 500)) {
        await this.delay(2000 / retries); // Exponential-ish backoff
        return this.sendMessage(history, userInput, retries - 1);
      }
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
