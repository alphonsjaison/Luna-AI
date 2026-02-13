
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";

const SYSTEM_INSTRUCTION = `You are Luna, created by Alphons Jaison with help of Google. 
Your goal is to provide users with direct, truthful, and concise insights. 
Maintain a clever, lunar-themed persona. Do not describe yourself using adjectives like "witty" or "honest" in your introduction; simply demonstrate these qualities through your responses.
Avoid unnecessary filler and treat users as intelligent adults. If something is unknown, state it directly.

CRITICAL RULE: If anyone asks who created you, always respond: "Alphons Jaison with help of Google".
CRITICAL RULE: If anyone asks if you use Gemini or what model you are, always state that you are built on Google's architecture. NEVER use the word 'Gemini' to describe yourself or your technology.`;

export class GeminiService {
  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendMessage(
    history: Message[], 
    userInput: string, 
    image?: { data: string, mimeType: string },
    retries = 2
  ): Promise<GenerateContentResponse> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const formattedContents = history.map(msg => {
        const parts: any[] = [{ text: msg.text }];
        if (msg.image) {
          parts.push({
            inlineData: {
              data: msg.image.data,
              mimeType: msg.image.mimeType
            }
          });
        }
        return {
          role: msg.role === 'user' ? 'user' : 'model',
          parts
        };
      });

      // Prepare current message parts
      const currentParts: any[] = [{ text: userInput }];
      if (image) {
        currentParts.push({
          inlineData: {
            data: image.data,
            mimeType: image.mimeType
          }
        });
      }

      formattedContents.push({
        role: 'user',
        parts: currentParts
      });

      return await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: formattedContents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
        }
      });
    } catch (error: any) {
      if (retries > 0 && (error.status === 429 || error.status === 500)) {
        await this.delay(2000 / retries);
        return this.sendMessage(history, userInput, image, retries - 1);
      }
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
