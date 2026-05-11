
import { useVoiceStore } from "../store/useVoiceStore";

export async function triggerMorningBrief(profile: any) {
  // 1. Check if brief already played today
  const today = new Date().toDateString();
  if (profile.lastBriefDate === today) {
    console.log("Morning Brief: Already played today.");
    return;
  }

  console.log("Morning Brief: Initializing...");
  
  try {
    // 2. Set state to processing
    useVoiceStore.getState().setVoiceState("processing");

    // 3. Request a brief from the Chat API with hidden system instruction
    const prompt = `Generate a 4-sentence morning brief for boss. 
    Include: current time (${new Date().toLocaleTimeString()}), 
    a reminder about their goals (${profile.goals?.join(", ") || "No goals set"}), 
    and one witty remark about starting the day. 
    Speak naturally, no markdown, no bullet points, be extremely concise.`;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt, sessionId: "morning-brief" }),
    });

    if (!res.ok) throw new Error("Brief request failed");

    // 4. Stream and Speak
    // The chat API returns SSE. We'll collect the full text for simplicity in the brief 
    // or use the existing streaming logic if we want it "alive".
    // For the morning brief, we'll fetch the full response then speak it.
    
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "text") fullText += data.content;
            } catch (e) {}
          }
        }
      }
    }

    if (fullText) {
      console.log("Morning Brief Content:", fullText);
      
      // 5. Trigger TTS via Sarvam
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullText }),
      });

      const ttsData = await ttsRes.json();
      if (ttsData.audioChunks && ttsData.audioChunks.length > 0) {
        // Play audio
        useVoiceStore.getState().setVoiceState("speaking");
        const audio = new Audio(`data:audio/wav;base64,${ttsData.audioChunks[0]}`);
        audio.onended = () => {
          useVoiceStore.getState().setVoiceState("idle");
          // 6. Mark brief as played
          updateBriefTimestamp();
        };
        audio.play();
      }
    }
  } catch (error) {
    console.error("Morning Brief Error:", error);
    useVoiceStore.getState().setVoiceState("idle");
  }
}

async function updateBriefTimestamp() {
  try {
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastBriefDate: new Date().toDateString() }),
    });
  } catch (e) {
    console.error("Failed to update brief timestamp");
  }
}
