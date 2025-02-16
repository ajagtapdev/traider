import { useState } from 'react';

export default function ChatBot() {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
  
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
  
      if (!response.body) throw new Error("No response body");
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = "";
      let buffer = "";
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
  
        // Process the stream chunk by chunk
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ||  ""; // Keep unfinished chunk for next iteration
  
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const json = JSON.parse(line.slice(6)); // Remove "data: " prefix
              const deltaContent = json.choices?.[0]?.delta?.content;
              if (deltaContent) {
                botMessage += deltaContent;
                setMessages([...newMessages, { role: "assistant", content: botMessage }]);
              }
            } catch (error) {
              console.error("Error parsing stream JSON:", error);
            }
          }
        }
      }
  
      setMessages([...newMessages, { role: "assistant", content: botMessage }]);
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  
    setLoading(false);
  };
  

return (
    <div className="w-full max-w-2xl mx-auto p-6 border rounded-lg shadow-lg bg-white">
        <div className="space-y-4">
            <div className="h-64 overflow-y-auto border p-4 rounded-lg bg-gray-50">
                {messages.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                        <span className={`inlin e-block px-4 py-2 rounded-lg ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-800"}`}>
                            {msg.content}
                        </span>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter your message..."
                    className="flex-1 border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={sendMessage} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50">
                    {loading ? "Sending..." : "Send"}
                </button>
            </div>
        </div>
    </div>
);
}
