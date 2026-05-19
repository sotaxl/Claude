"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Send, Paperclip, MoreVertical, Phone, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import { mockConversations, mockMessages } from "@/lib/mock-data";

export default function MessagesPage() {
  const [activeConv, setActiveConv] = useState(mockConversations[0].id);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [search, setSearch] = useState("");

  const conversation = mockConversations.find((c) => c.id === activeConv);
  const currentMessages = messages[activeConv] ?? [];

  const filteredConvs = mockConversations.filter(
    (c) => !search || c.participant.name.toLowerCase().includes(search.toLowerCase())
  );

  function sendMessage() {
    if (!newMessage.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [activeConv]: [
        ...(prev[activeConv] ?? []),
        {
          id: `new-${Date.now()}`,
          senderId: "you",
          content: newMessage.trim(),
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    setNewMessage("");
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex gap-0 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Conversation list */}
      <div className="w-72 flex-shrink-0 border-r border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="pl-9 text-xs h-8"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConvs.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConv(conv.id)}
              className={cn(
                "w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-slate-50 border-b border-slate-50",
                activeConv === conv.id && "bg-brand-50 hover:bg-brand-50 border-l-2 border-l-brand-500"
              )}
            >
              <div className="relative flex-shrink-0">
                <Image
                  src={conv.participant.image}
                  alt={conv.participant.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                {conv.unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={cn("text-sm truncate", conv.unread > 0 ? "font-bold text-slate-900" : "font-medium text-slate-800")}>
                    {conv.participant.name}
                  </span>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">
                    {new Date(conv.lastMessageAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{conv.participant.trade}</span>
                <p className={cn("text-xs mt-0.5 truncate", conv.unread > 0 ? "text-slate-600 font-medium" : "text-slate-400")}>
                  {conv.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {conversation ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white">
            <Image
              src={conversation.participant.image}
              alt={conversation.participant.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900">{conversation.participant.name}</div>
              <div className="text-xs text-slate-400">{conversation.participant.trade} · Usually responds within 2 hours</div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 messages-scroll bg-slate-50">
            {currentMessages.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                Start the conversation with {conversation.participant.name}
              </div>
            )}
            {currentMessages.map((msg) => {
              const isMe = msg.senderId === "you";
              return (
                <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                  {!isMe && (
                    <Image
                      src={conversation.participant.image}
                      alt=""
                      width={28}
                      height={28}
                      className="rounded-full object-cover mr-2 flex-shrink-0 self-end"
                    />
                  )}
                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isMe
                      ? "bg-brand-500 text-white rounded-br-sm"
                      : "bg-white text-slate-800 shadow-sm rounded-bl-sm border border-slate-100"
                  )}>
                    {msg.content}
                    <div className={cn("text-[10px] mt-1 text-right", isMe ? "text-brand-200" : "text-slate-400")}>
                      {new Date(msg.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex items-center gap-2"
            >
              <Button variant="ghost" size="icon" type="button" className="flex-shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${conversation.participant.name}...`}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <div className="text-4xl mb-3">💬</div>
            <p>Select a conversation to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
}
