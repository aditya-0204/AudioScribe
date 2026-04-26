import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface TranscriptionResponse {
  text: string;
}

export async function transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
  const model = "gemini-3-flash-preview";
  
  const prompt = "Please transcribe this audio file accurately. Return only the transcription text, nothing else. If there is no speech, say 'No speech detected'.";
  
  const audioPart = {
    inlineData: {
      data: base64Audio,
      mimeType: mimeType
    }
  };

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [audioPart, { text: prompt }] },
  });

  return response.text || "Transcription failed or was empty.";
}
