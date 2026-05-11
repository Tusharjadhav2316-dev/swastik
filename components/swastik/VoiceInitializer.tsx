
"use client";

import { useVoicePipeline } from "@/lib/voice-pipeline";

export default function VoiceInitializer() {
  useVoicePipeline();
  return null;
}
