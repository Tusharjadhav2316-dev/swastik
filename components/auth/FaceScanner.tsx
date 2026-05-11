"use client";

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

interface FaceScannerProps {
  onFaceDetected: (descriptor: Float32Array) => void;
  compact?: boolean;
}

export default function FaceScanner({ onFaceDetected, compact }: FaceScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Stable ref so the detection loop never needs to restart on parent re-renders
  const callbackRef = useRef(onFaceDetected);
  const firedRef = useRef(false);
  const detectingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [stage, setStage] = useState<"loading" | "ready" | "error">("loading");
  const [label, setLabel] = useState("Loading models…");

  useEffect(() => { callbackRef.current = onFaceDetected; }, [onFaceDetected]);

  // 1 — load models
  useEffect(() => {
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models")
      .then(() => faceapi.nets.faceLandmark68Net.loadFromUri("/models"))
      .then(() => faceapi.nets.faceRecognitionNet.loadFromUri("/models"))
      .then(() => { setStage("ready"); setLabel("Starting camera…"); })
      .catch(() => { setStage("error"); setLabel("Failed to load models."); });
  }, []);

  // 2 — camera
  useEffect(() => {
    if (stage !== "ready") return;
    let stream: MediaStream;
    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: "user" } })
      .then(s => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => { setStage("error"); setLabel("Allow camera access."); });
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, [stage]);

  // 3 — detection loop starts when video plays
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      setLabel("▸ Align face within frame…");

      intervalRef.current = setInterval(async () => {
        if (detectingRef.current || firedRef.current) return;
        if (!video || !canvasRef.current) return;
        if (video.readyState < 2) return;

        detectingRef.current = true;
        try {
          const det = await faceapi
            .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
            .withFaceLandmarks()
            .withFaceDescriptor();

          const cv = canvasRef.current;
          if (!cv) return;
          const ctx = cv.getContext("2d");
          ctx?.clearRect(0, 0, cv.width, cv.height);

          if (det && ctx) {
            const r = faceapi.resizeResults(det, { width: cv.width, height: cv.height });
            const { x, y, width, height } = r.detection.box;
            ctx.strokeStyle = "#00d4ff";
            ctx.lineWidth = 2;
            ctx.shadowColor = "#00d4ff";
            ctx.shadowBlur = 6;
            ctx.strokeRect(x, y, width, height);
            ctx.shadowBlur = 0;

            const score = det.detection.score;
            setLabel(`▸ Face locked — ${Math.round(score * 100)}%`);

            if (score > 0.5 && !firedRef.current) {
              firedRef.current = true;
              setLabel("▸ Pattern captured. Authenticating…");
              if (intervalRef.current) clearInterval(intervalRef.current);
              callbackRef.current(det.descriptor);
            }
          } else {
            setLabel("▸ Align face within frame…");
          }
        } finally {
          detectingRef.current = false;
        }
      }, 200);
    };

    video.addEventListener("play", onPlay);
    return () => {
      video.removeEventListener("play", onPlay);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const w = compact ? 260 : 320;
  const h = compact ? 195 : 240;

  return (
    <div
      className="relative rounded-lg overflow-hidden bg-black"
      style={{ width: w, height: h, border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {stage !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060609] z-20 gap-3">
          {stage === "loading" && (
            <div className="w-5 h-5 border-2 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full animate-spin" />
          )}
          <p className="text-[#00d4ff] font-mono text-[10px] tracking-widest uppercase animate-pulse">{label}</p>
        </div>
      )}
      <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
      {/* Corner brackets */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#00d4ff] opacity-60" />
        <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#00d4ff] opacity-60" />
        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#00d4ff] opacity-60" />
        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#00d4ff] opacity-60" />
      </div>
    </div>
  );
}
