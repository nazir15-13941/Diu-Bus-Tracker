import { GoogleGenAI } from "@google/genai";
import { ROUTES } from '../constants';

const API_KEY = process.env.API_KEY || '';

class GeminiService {
  private ai: GoogleGenAI;
  private modelId = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async getTransportResponse(userQuery: string): Promise<string> {
    try {
      if (!API_KEY) return "Please configure your API Key to use the AI Assistant.";

      // Prepare context about the routes to ground the AI
      const routeContext = ROUTES.map(r => 
        `${r.name} (stops: ${r.stops.join(', ')})`
      ).join('\n');

      const systemInstruction = `
        You are the intelligent transport assistant for Daffodil International University (DIU).
        Your name is "DIU Bot".
        You help students find bus schedules, routes, and estimated times.
        
        Here is the current route data:
        ${routeContext}
        
        Current time: ${new Date().toLocaleTimeString()}
        
        Rules:
        1. Be concise and friendly.
        2. If asked about a specific location not in the list, politely say we don't cover it yet.
        3. Assume standard traffic conditions unless told otherwise.
        4. Focus on transport related queries.
      `;

      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: userQuery,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      return response.text || "I'm having trouble connecting to the schedule database right now.";

    } catch (error) {
      console.error("Gemini Error:", error);
      return "Sorry, I'm currently offline. Please check the schedule manually.";
    }
  }
}

export const geminiService = new GeminiService();
