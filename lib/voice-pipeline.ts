
"use client";

import { useEffect, useCallback } from "react";
import { useVoiceStore, VoiceState } from "@/store/useVoiceStore";
import { useVisualStore } from "@/store/useVisualStore";
import { startWakeWordDetection } from "@/lib/wake-word";

// Global singletons to prevent multiple instances from overlapping
let globalMediaRecorder: MediaRecorder | null = null;
let globalAudioChunks: Blob[] = [];
let globalAudioQueue: string[] = [];
let globalIsPlaying = false;
let globalIsInitializing = false;
let currentAudio: HTMLAudioElement | null = null;
let eventListenersAttached = false;

export function useVoicePipeline() {
  const { setVoiceState, setTranscript, setIsRecording, setError } = useVoiceStore();

  const playNextInQueue = useCallback(() => {
    if (globalAudioQueue.length === 0 || globalIsPlaying) {
      if (globalAudioQueue.length === 0 && !globalIsPlaying) {
        setVoiceState("idle");
      }
      return;
    }

    globalIsPlaying = true;
    setVoiceState("speaking");
    const base64 = globalAudioQueue.shift();
    if (!base64) return;

    currentAudio = new Audio(`data:audio/wav;base64,${base64}`);
    currentAudio.onended = () => {
      globalIsPlaying = false;
      playNextInQueue();
    };
    currentAudio.play().catch(e => {
      console.error("Audio playback failed:", e);
      globalIsPlaying = false;
      playNextInQueue();
    });
  }, [setVoiceState]);

  const fetchTTS = async (text: string) => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.audioChunks) {
        globalAudioQueue.push(...data.audioChunks);
        playNextInQueue();
      }
    } catch (e) {
      console.error("TTS fetch failed:", e);
    }
  };

  const submitToLLM = async (text: string) => {
    setVoiceState("processing");
    let fullResponse = "";
    let currentSentence = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, mode: "student" }),
      });

      if (!response.ok) throw new Error("Chat failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.type === "text") {
              const content = data.content;
              fullResponse += content;
              currentSentence += content;

              // Check for sentence completion
              if (/[.!?]/.test(content)) {
                fetchTTS(currentSentence);
                currentSentence = "";
              }
            } else if (data.type === "visual") {
              useVisualStore.getState().setVisual(data.visualType, data.data);
            }
          }
        }
      }
      
      if (currentSentence.trim()) {
        fetchTTS(currentSentence);
      }
    } catch (e) {
      console.error("LLM submission failed:", e);
      setVoiceState("error");
      setError("My brain timed out boss. Internet issue maybe.");
      setTimeout(() => setVoiceState("idle"), 2000);
    }
  };

  const startRecording = async () => {
    if (globalMediaRecorder?.state === "recording" || globalIsInitializing) return;
    
    // Stop any currently playing audio immediately
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    globalAudioQueue = [];
    globalIsPlaying = false;
    
    console.log("SWASTIK: Starting recording...");
    globalIsInitializing = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      globalMediaRecorder = new MediaRecorder(stream);
      globalAudioChunks = [];

      globalMediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          globalAudioChunks.push(e.data);
        }
      };

      globalMediaRecorder.onstop = async () => {
        console.log("SWASTIK: Recording stopped. Processing chunks:", globalAudioChunks.length);
        
        if (globalAudioChunks.length === 0) {
          console.error("SWASTIK: No audio chunks captured.");
          setVoiceState("idle");
          return;
        }

        setVoiceState("processing");
        const mimeType = "audio/webm";

        const audioBlob = new Blob(globalAudioChunks, { type: mimeType });
        console.log("SWASTIK: Blob created. Size:", audioBlob.size, "Type:", mimeType);
        
        if (audioBlob.size < 100) {
          console.warn("SWASTIK: Audio blob is too small.");
          setVoiceState("idle");
          return;
        }

        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.webm");

        try {
          const res = await fetch("/api/stt", { method: "POST", body: formData });
          const data = await res.json();
          
          if (data.transcript) {
            setTranscript(data.transcript);
            submitToLLM(data.transcript);
          } else {
            setVoiceState("idle");
          }
        } catch (e) {
          setVoiceState("error");
          setError("Could not hear you clearly boss. Please try again.");
          setTimeout(() => setVoiceState("idle"), 2000);
        }
      };

      globalMediaRecorder.start(200);
      setVoiceState("listening");
      setIsRecording(true);
    } catch (e) {
      console.error("SWASTIK: Mic access denied:", e);
      setVoiceState("error");
      setError("SWASTIK: Microphone access denied. Please allow mic permission boss.");
    } finally {
      globalIsInitializing = false;
    }
  };

  const stopRecording = () => {
    const stop = () => {
      if (globalMediaRecorder && globalMediaRecorder.state === "recording") {
        globalMediaRecorder.stop();
        setIsRecording(false);
        globalMediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };

    // If still initializing, wait a bit then stop
    if (globalIsInitializing) {
      setTimeout(stop, 300);
    } else {
      stop();
    }
  };

  useEffect(() => {
    if (eventListenersAttached) return;
    eventListenersAttached = true;

    // Wake Word Detection
    const stopWakeWord = startWakeWordDetection(() => {
      console.log("SWASTIK: Wake word triggered!");
      setVoiceState("wake");
      
      // Play a quick chime
      const chime = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
      chime.volume = 0.5;
      chime.play().catch(() => {});

      setTimeout(() => {
        startRecording();
      }, 500);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        startRecording();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        stopRecording();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (stopWakeWord) stopWakeWord();
      eventListenersAttached = false;
    };
  }, [startRecording, stopRecording, setVoiceState]);

  return { 
    startRecording, 
    stopRecording,
    isRecording: !!globalMediaRecorder && globalMediaRecorder.state === "recording" 
  };
}

