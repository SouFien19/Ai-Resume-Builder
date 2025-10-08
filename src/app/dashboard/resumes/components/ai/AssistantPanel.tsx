"use client";

import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare } from "lucide-react";

interface Msg { role: "user" | "assistant"; content: string }

export default function AssistantPanel() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const ask = async () => {
    if (!input.trim()) return;
  const next: Msg[] = [...messages, { role: "user", content: input.trim() }];
  setMessages(next as Msg[]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const data = await res.json();
      const reply = (data?.text || "").trim();
  setMessages(m => ([...m, { role: "assistant", content: reply }] as Msg[]));
    } finally { setBusy(false); endRef.current?.scrollIntoView({ behavior: "smooth" }); }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">AI Assistant</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48 overflow-y-auto border rounded-md p-3 mb-3 bg-muted/20">
          {messages.length === 0 ? (
            <div className="text-sm text-muted-foreground">Ask for help with wording, bullet points, keywords, or career tips.</div>
          ) : (
            <div className="space-y-2">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div className={`inline-block rounded-md px-2 py-1 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-white border"}`}>{m.content}</div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Textarea rows={2} value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything about your resume…" />
          <Button onClick={ask} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
