export interface TranscriptionResponse {
  text: string;
}

export async function transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
  const response = await fetch("/api/transcribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio: base64Audio,
      mimeType: mimeType,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Server transcription failed");
  }

  const data: TranscriptionResponse = await response.json();
  return data.text || "Transcription failed or was empty.";
}
