"use client";

import { useThreadMessages } from "@convex-dev/agent/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { useEffect, useRef } from "react";
import { api } from "@/convex/_generated/api";

const MessageList = ({ threadId }: { threadId: string }) => {
  const messageResult = useThreadMessages(
    api.chat.listThreadMessages,
    { threadId },
    { initialNumItems: 10, stream: true },
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageResult?.results]);

  if (!messageResult || messageResult.results.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-gray-400">
        <Bot className="h-12 w-12 mx-auto mb-4" />
        <p>No messages yet</p>
      </div>
    );
  }

  console.log("messageResult", messageResult);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messageResult.results.map((m) => {
        if (!m.message) return null;
        const isUser = m.message.role === "user";

        // ✅ If tool-result with movies → render inside assistant bubble
        if (m.message.role === "tool") {
          const toolMsg = m.message.content?.find(
            (c: any) => c.type === "tool-result",
          );
          if (toolMsg?.output?.value?.movies) {
            return (
              <div key={m._id} className="flex justify-start gap-3">
                <Avatar className="h-8 w-8 bg-purple-600">
                  <AvatarFallback>
                    <Bot className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-700 text-gray-100 space-y-2">
                  {toolMsg.output.value.movies.map((movie: any) => (
                    <a
                      key={movie.id}
                      href={movie.url}
                      className="block text-purple-300 hover:underline"
                    >
                      {movie.title}
                    </a>
                  ))}
                </div>
              </div>
            );
          }
        }

        // ✅ Normal user or assistant text messages
        return (
          <div
            key={m._id}
            className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
          >
            {!isUser && (
              <Avatar className="h-8 w-8 bg-purple-600">
                <AvatarFallback>
                  <Bot className="h-4 w-4 text-white" />
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed break-words ${
                isUser
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-100"
              }`}
            >
              {m.text}
            </div>
            {isUser && (
              <Avatar className="h-8 w-8 bg-gray-600">
                <AvatarFallback>
                  <User className="h-4 w-4 text-white" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
