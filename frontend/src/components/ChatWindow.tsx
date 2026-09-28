"use client";

import { useRef, useState, useEffect } from "react";
import { Send } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export function ChatWindow({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setDraft("");
    setSending(true);
    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      body,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? { ...data, createdAt: data.createdAt } : m)));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(body);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[75%] space-y-0.5")}>
                <div
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-sm",
                    mine ? "bg-primary text-primary-foreground" : "bg-surface-muted text-foreground"
                  )}
                >
                  {m.body}
                </div>
                <p className={cn("text-[10px] text-muted-foreground", mine && "text-right")}>
                  {formatRelativeTime(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          className="h-10 flex-1 rounded-full border border-border-strong bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
