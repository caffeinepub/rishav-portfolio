import { Bot, Send, Sparkles, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
}

const SUGGESTIONS = [
  "Show gaming edits",
  "Best videos",
  "What services do you offer?",
  "How to contact?",
];

interface AIChatModalProps {
  open: boolean;
  onClose: () => void;
}

export function AIChatModal({ open, onClose }: AIChatModalProps) {
  const { actor } = useActor();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "ai",
      content:
        "Hey! I'm Rishav's AI assistant. Ask me about his work, services, or how to get in touch! 🎬",
    },
  ]);
  const msgIdRef = useRef(1);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom on message change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: msgIdRef.current++, role: "user", content: msg },
    ]);
    setIsLoading(true);

    try {
      let searchContext = "";
      if (actor) {
        try {
          const result = await actor.search(msg);
          searchContext = JSON.stringify(result);
        } catch {
          searchContext = "";
        }
      }

      const prompt = searchContext
        ? `You are Rishav's AI portfolio assistant. Based on these portfolio results: ${searchContext}, answer this question: "${msg}". Be concise, helpful, and enthusiastic about Rishav's work.`
        : `You are Rishav's AI portfolio assistant. Rishav is a professional video editor who specializes in reels, YouTube content, color grading, and motion graphics. Answer this question: "${msg}". Be concise and helpful.`;

      let response =
        "I'm having trouble connecting right now. Please try again or contact Rishav directly on WhatsApp!";

      if (actor) {
        try {
          response = await actor.aiProxy(prompt);
        } catch {
          // fallback
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: msgIdRef.current++, role: "ai", content: response },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-ocid="ai_chat.modal"
          className="fixed bottom-24 left-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 rounded-t-2xl"
            style={{
              background: "oklch(0.1 0.005 240 / 0.95)",
              borderBottom: "1px solid oklch(0.82 0.22 193 / 0.2)",
              backdropFilter: "blur(20px)",
              border: "1px solid oklch(0.82 0.22 193 / 0.2)",
              borderBottomWidth: "0",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "oklch(0.82 0.22 193 / 0.15)",
                  border: "1px solid oklch(0.82 0.22 193 / 0.4)",
                }}
              >
                <Sparkles size={16} style={{ color: "var(--neon)" }} />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.92 0.01 240)" }}
                >
                  Rishav AI
                </p>
                <p className="text-xs" style={{ color: "var(--neon)" }}>
                  Online
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "oklch(0.55 0.02 240)" }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{
              minHeight: "280px",
              maxHeight: "360px",
              background: "oklch(0.08 0.004 240 / 0.95)",
              backdropFilter: "blur(20px)",
              borderLeft: "1px solid oklch(0.82 0.22 193 / 0.2)",
              borderRight: "1px solid oklch(0.82 0.22 193 / 0.2)",
            }}
          >
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{
                    background:
                      m.role === "ai"
                        ? "oklch(0.82 0.22 193 / 0.2)"
                        : "oklch(0.75 0.16 280 / 0.2)",
                    border:
                      m.role === "ai"
                        ? "1px solid oklch(0.82 0.22 193 / 0.4)"
                        : "1px solid oklch(0.75 0.16 280 / 0.4)",
                  }}
                >
                  {m.role === "ai" ? (
                    <Bot size={12} style={{ color: "var(--neon)" }} />
                  ) : (
                    <User size={12} style={{ color: "oklch(0.82 0.16 280)" }} />
                  )}
                </div>
                <div
                  className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                  }`}
                  style={{ color: "oklch(0.88 0.01 240)" }}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2"
              >
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: "oklch(0.82 0.22 193 / 0.2)",
                    border: "1px solid oklch(0.82 0.22 193 / 0.4)",
                  }}
                >
                  <Bot size={12} style={{ color: "var(--neon)" }} />
                </div>
                <div className="chat-bubble-ai px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div
              className="px-3 py-2 flex flex-wrap gap-1.5"
              style={{
                background: "oklch(0.08 0.004 240 / 0.95)",
                backdropFilter: "blur(20px)",
                borderLeft: "1px solid oklch(0.82 0.22 193 / 0.2)",
                borderRight: "1px solid oklch(0.82 0.22 193 / 0.2)",
              }}
            >
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSend(s)}
                  className="px-2.5 py-1 rounded-lg text-xs transition-all"
                  style={{
                    background: "oklch(0.82 0.22 193 / 0.08)",
                    border: "1px solid oklch(0.82 0.22 193 / 0.2)",
                    color: "oklch(0.75 0.15 193)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            className="p-3 rounded-b-2xl flex gap-2"
            style={{
              background: "oklch(0.1 0.005 240 / 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid oklch(0.82 0.22 193 / 0.2)",
              borderTopWidth: "1px",
              borderTopColor: "oklch(0.82 0.22 193 / 0.15)",
            }}
          >
            <input
              ref={inputRef}
              data-ocid="ai_chat.input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Rishav's work..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{
                color: "oklch(0.88 0.01 240)",
                caretColor: "var(--neon)",
              }}
              disabled={isLoading}
            />
            <button
              type="button"
              data-ocid="ai_chat.submit_button"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
              style={{
                background: "oklch(0.82 0.22 193 / 0.2)",
                border: "1px solid oklch(0.82 0.22 193 / 0.4)",
                color: "var(--neon)",
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
