
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, voice = "kavya" } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Split into sentences (simple regex)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    // Call Sarvam TTS for each sentence
    const audioChunksPromises = sentences.map(async (sentence: string) => {
      const response = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": process.env.SARVAM_API_KEY || "",
        },
        body: JSON.stringify({
          inputs: [sentence.trim()],
          target_language_code: "en-IN",
          speaker: voice,
          model: "bulbul:v3",
          enable_preprocessing: true,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Sarvam TTS error for sentence:", sentence, "| API Response:", errText);
        return null;
      }

      const data = await response.json();
      return data.audios?.[0] || null; // Returns base64 wav
    });

    const audioChunks = (await Promise.all(audioChunksPromises)).filter(Boolean);

    return NextResponse.json({
      audioChunks,
      format: "wav",
    });
  } catch (err: any) {
    console.error("TTS Route Error:", err.message);
    return NextResponse.json({ error: "Failed to generate TTS" }, { status: 500 });
  }
}
