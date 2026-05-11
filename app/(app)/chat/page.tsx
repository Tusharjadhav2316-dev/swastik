
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VisualPanel from "@/components/chat/VisualPanel";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamedText, setCurrentStreamedText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamedText]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = input;
    setInput("");
    setIsStreaming(true);
    setCurrentStreamedText("");

    let accumulatedText = "";
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          sessionId: "active-session",
          mode: "student",
          emotion: "neutral",
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const textDecoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = textDecoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;
          
          try {
            const data = JSON.parse(trimmedLine.slice(6));
            if (data.type === "text") {
              accumulatedText += data.content;
              setCurrentStreamedText(accumulatedText);
            } else if (data.type === "done") {
              setIsStreaming(false);
            }
          } catch (e) {
            console.error("Error parsing SSE line:", trimmedLine, e);
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: accumulatedText,
          id: (Date.now() + 1).toString(),
        },
      ]);
      setCurrentStreamedText("");
      setIsStreaming(false);
    } catch (error) {
      console.error("Chat error:", error);
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-full gap-8">
      {/* Left 60%: Message List */}
      <div className="w-[60%] flex flex-col h-full bg-[#06060c]/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl p-5 ${
                msg.role === "user" 
                  ? "bg-cyan-500/10 border border-cyan-500/20 text-white rounded-tr-none" 
                  : "bg-white/[0.03] border-l-2 border-l-cyan-400 border border-white/5 text-white/90 rounded-tl-none backdrop-blur-xl"
              }`}>
                <p className="font-mono text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Current stream or thinking indicator */}
          {isStreaming && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl p-5 bg-white/[0.03] border-l-2 border-l-cyan-400 border border-white/5 text-white/90 rounded-tl-none backdrop-blur-xl">
                {currentStreamedText ? (
                  <p className="font-mono text-xs leading-relaxed whitespace-pre-wrap">{currentStreamedText}</p>
                ) : (
                  <div className="flex gap-1 py-2">
                    <motion.div className="w-1 h-1 bg-cyan-400 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />
                    <motion.div className="w-1 h-1 bg-cyan-400 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                    <motion.div className="w-1 h-1 bg-cyan-400 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/5 bg-white/[0.01]">
          <div className="relative flex items-center gap-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Address SWASTIK... (Shift+Enter for newline)"
              className="flex-1 bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 text-sm font-mono text-white outline-none focus:border-cyan-400/30 focus:bg-cyan-400/5 transition-all resize-none h-14 max-h-32 placeholder:text-white/10"
              disabled={isStreaming}
            />
            <button 
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ◈
            </button>
          </div>
        </div>
      </div>

      {/* Right 40%: Visual Panel */}
      <div className="w-[40%] h-full">
        <VisualPanel />
      </div>
    </div>
  );
}
