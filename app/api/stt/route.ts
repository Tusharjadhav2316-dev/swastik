
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get("audio");

    if (!audioBlob) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }
    // Create a new strict blob to completely strip any `codecs=opus` or invalid types
    // that might be sent by older browser caches or specific MediaRecorders
    const cleanBlob = new Blob([audioBlob as Blob], { type: "audio/webm" });

    const sarvamFormData = new FormData();
    sarvamFormData.append("file", cleanBlob, "audio.webm");
    sarvamFormData.append("model", "saaras:v3");
    sarvamFormData.append("language_code", "en-IN");

    console.log("SWASTIK: Forwarding audio to Sarvam...");
    const response = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": process.env.SARVAM_API_KEY || "",
      },
      body: sarvamFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Sarvam STT Error:", errorText);
      return NextResponse.json({ transcript: "", error: true });
    }

    const data = await response.json();
    return NextResponse.json({
      transcript: data.transcript || "",
      confidence: data.confidence || 0,
    });
  } catch (err: any) {
    console.error("STT Route Error:", err.message);
    return NextResponse.json({ transcript: "", error: true });
  }
}
