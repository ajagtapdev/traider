"use client";
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const messageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const Chatbot: React.FC = () => {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Create user message and update chat log
    const userMessage: Message = { role: "user", content: input.trim() };
    setChatLog((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [userMessage] }),
      });

      if (!response.ok) {
        console.error("Error:", response.statusText);
        setLoading(false);
        return;
      }

      // Prepare to stream the response
      const reader = response.body?.getReader();
      if (!reader) {
        console.error("No reader available.");
        setLoading(false);
        return;
      }
      const decoder = new TextDecoder();
      let assistantMessage = "";

      // Append an empty assistant message to be updated in real time
      setChatLog((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const events = chunk.split("\n\n");
        for (const event of events) {
          if (event.startsWith("data: ")) {
            const dataStr = event.replace("data: ", "").trim();
            if (dataStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantMessage += delta;
                setChatLog((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: assistantMessage };
                  return updated;
                });
                // Auto-scroll to the bottom of the conversation
                chatContainerRef.current?.scrollTo({
                  top: chatContainerRef.current.scrollHeight,
                  behavior: "smooth",
                });
              }
            } catch (error) {
              console.error("Error parsing SSE data:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow mt-6">
      <CardHeader>
        <CardTitle className="text-[#408830]">AI Trading Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Conversation Area with fixed height and scroll */}
          <div
            ref={chatContainerRef}
            className="flex flex-col gap-2 h-64 overflow-y-auto border rounded p-2"
          >
            {chatLog.map((msg, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                animate="visible"
                variants={messageVariants}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`max-w-xl break-words p-2 rounded-lg ${
                  msg.role === "assistant"
                    ? "self-start bg-gray-200 text-black"
                    : "self-end bg-green-800 text-white"
                }`}
              >
                {msg.content}
              </motion.div>
            ))}
          </div>

          {/* Input and Send Button */}
          <div className="flex gap-4">
            <Input
              placeholder="Ask me anything about trading..."
              className="flex-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-[#408830] hover:bg-[#509048]"
                onClick={handleSend}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send"}
              </Button>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chatbot;
