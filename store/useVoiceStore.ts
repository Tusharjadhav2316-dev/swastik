import { create } from "zustand";

export type VoiceState = "idle" | "wake" | "listening" | "processing" | "speaking" | "error";

interface VoiceStore {
  voiceState: VoiceState;
  setVoiceState: (state: VoiceState) => void;
  transcript: string;
  setTranscript: (text: string) => void;
  isRecording: boolean;
  setIsRecording: (val: boolean) => void;
  // Error handling
  errorMessage: string | null;
  setError: (msg: string) => void;
  clearError: () => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  voiceState: "idle",
  setVoiceState: (state) => set({ voiceState: state }),
  transcript: "",
  setTranscript: (text) => set({ transcript: text }),
  isRecording: false,
  setIsRecording: (val) => set({ isRecording: val }),
  // Error handling
  errorMessage: null,
  setError: (msg) => set({ errorMessage: msg }),
  clearError: () => set({ errorMessage: null }),
}));
