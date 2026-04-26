import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing large JSON payloads (base64 audio)
  app.use(express.json({ limit: '20mb' }));

  // API Route: Transcription
  app.post("/api/transcribe", async (req, res) => {
    try {
      const { audio, mimeType } = req.body;
      
      if (!audio || !mimeType) {
        return res.status(400).json({ error: "Missing audio data or mimeType" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("CRITICAL: GEMINI_API_KEY is not set in environment variables.");
        return res.status(500).json({ error: "Server Configuration Error: GEMINI_API_KEY is missing. Please add it to your Railway Variables." });
      }

      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

      const prompt = "Please transcribe this audio file accurately. Return only the transcription text, nothing else. If there is no speech, say 'No speech detected'.";
      
      const audioPart = {
        inlineData: {
          data: audio,
          mimeType: mimeType
        }
      };

      const result = await model.generateContent([prompt, audioPart]);
      const text = result.response.text();

      res.json({ text: text || "Transcription failed." });
    } catch (error: any) {
      console.error("Transcription error:", error);
      res.status(500).json({ error: error.message || "Internal server error during transcription" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
