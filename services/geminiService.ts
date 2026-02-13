
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
  async sendMessage(history: Message[], userInput: string): Promise<GenerateContentResponse> {
    // The SDK requires initializing with an object containing the apiKey.
    // Vite will replace 'process.env.API_KEY' with the actual value during the build process.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const formattedContents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add current user input
    formattedContents.push({
      role: 'user',
      parts: [{ text: userInput }]
    });

    return await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
      }
    });
  }
}

export const geminiService = new GeminiService();
