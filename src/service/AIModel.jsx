import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY;
const genAI = new GoogleGenAI({ apiKey });

export const generateTrip = async (prompt) => {
  const response = await genAI.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: prompt,
    config: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  });

  if (!response.text) {
    throw new Error('Gemini returned an empty response.');
  }

  return response.text;
};