"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ChatMessage, Conversation } from "@/types";

function MessagesContent() {
  const searchParams = useSearchParams();
  const initialConv = searchParams.get("conversation");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeId = selectedId ?? initialConv;
  const [draft, setDraft] = useState("");

  const { data: convData } = useQuery({
    queryKey: ["conversations"],
    enabled: Boolean(user),
    refetchInterval: 8000,
    queryFn: () => apiFetch<{ conversations: Conversation[] }>("/conversations"),
  });

  const { data: msgData } = useQuery({
    queryKey: ["messages", activeId],
    enabled: Boolean(user && activeId),
    refetchInterval: 4000,
    queryFn: () => apiFetch<{ messages: ChatMessage[] }>(`/conversations/${activeId}/messages`),
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;
    await apiFetch(`/conversations/${activeId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content: draft }),
    });
    setDraft("");
    void queryClient.invalidateQueries({ queryKey: ["messages", activeId] });
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-slate-600">
        Please sign in to view your messages.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Messages</h1>
      <div className="grid min-h-[520px] gap-4 md:grid-cols-3">
        <Card className="overflow-y-auto p-3">
          {(convData?.conversations ?? []).length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No conversations yet.</p>
          ) : (
            <div className="space-y-1.5">
              {(convData?.conversations ?? []).map((conv) => {
                const other = conv.participants.find((p) => p.user_id !== user.id);
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full rounded-xl p-3 text-left transition-colors ${
                      activeId === conv.id ? "bg-emerald-50 text-emerald-900" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{other?.profile?.full_name || "User"}</span>
                      {conv.unread_count > 0 && (
                        <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    {conv.post && <p className="truncate text-xs text-slate-500">{conv.post.title}</p>}
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="flex flex-col md:col-span-2">
          {!activeId ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-slate-400">
              <MessageSquare className="mb-2 h-8 w-8" />
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {(msgData?.messages ?? []).map((m) => {
                  const mine = m.sender_id === user.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                          mine ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        <p>{m.content}</p>
                        <span className={`mt-1 block text-[10px] ${mine ? "text-emerald-100" : "text-slate-400"}`}>
                          {new Date(m.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-200 p-3">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message... (never share PIN/OTP/CVV)"
                />
                <Button type="submit">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
