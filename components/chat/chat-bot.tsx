"use client";

import { useAction, useMutation } from "convex/react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";

import { api } from "@/convex/_generated/api";
import MessageList from "./message-list";

function getThreadIdFromHash() {
  return window.location.hash.replace(/^#/, "") || undefined;
}

export default function BotButton() {
  const createThread = useMutation(api.agent.createThread);
  const [threadId, setThreadId] = useState<string | undefined>(
    typeof window !== "undefined" ? getThreadIdFromHash() : undefined,
  );
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    function onHashChange() {
      setThreadId(getThreadIdFromHash());
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const resetThread = useCallback(() => {
    void createThread().then((newId) => {
      window.location.hash = newId;
      setThreadId(newId);
    });
  }, [createThread]);

  useEffect(() => {
    if (!threadId) {
      void resetThread();
    }
  }, [resetThread, threadId]);

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg transition-colors z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">CineRate Bot</h3>
                  <p className="text-xs text-gray-400">Always here to help</p>
                </div>
              </div>
              <Button
                onClick={() => setIsChatOpen(false)}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:bg-gray-800 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col">
              {threadId ? (
                <ThreadView threadId={threadId} />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">Loading chat...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ThreadView({ threadId }: { threadId: string }) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const sendMessageToAgent = useAction(api.agent.sendMessageToAgent);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList threadId={threadId} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-gray-700 bg-gray-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!message.trim()) return;

            setIsLoading(true);
            void sendMessageToAgent({
              threadId,
              prompt: message.trim(),
            })
              .then(() => setMessage(""))
              .finally(() => setIsLoading(false));
          }}
          className="flex gap-2"
        >
          <Input
            type="text"
            placeholder="Type your message..."
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            className="flex-1 bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
            disabled={isLoading}
          />
          <Button
            disabled={isLoading || !message.trim()}
            type="submit"
            size="icon"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-4 w-4 text-white" />
          </Button>
        </form>
      </div>
    </div>
  );
}
