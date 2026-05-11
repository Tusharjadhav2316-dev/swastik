
export function startWakeWordDetection(onWake: () => void) {
  const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  if (!SR) {
    console.error("Web Speech API not supported in this browser.");
    return;
  }
  
  const recog = new SR();
  recog.continuous = true;
  recog.interimResults = true;
  recog.lang = 'en-IN';
  
  recog.onresult = (e: any) => {
    const text = Array.from(e.results)
      .map((r: any) => (r as any)[0].transcript)
      .join('').toLowerCase();
    
    if (text.includes('swastik') || text.includes('swasthik')) {
      recog.stop();
      onWake();  // ← triggers VoiceOrb + recording
      setTimeout(() => {
        try { recog.start(); } catch(err) {}
      }, 3000);  // restart after response
    }
  };
  
  recog.onend = () => {
    try { recog.start(); } catch(err) {}
  };

  try {
    recog.start();
    console.log("SWASTIK: Wake word detection active (Web Speech API). Say 'Swastik'...");
  } catch (err) {
    console.error("Failed to start wake word detection:", err);
  }

  return () => {
    recog.onend = null;
    recog.stop();
  };
}
