import { useState, useRef, useEffect } from "react";
import { sendMessageToWeatherAgent } from "@/app/libs/api";


interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatProps {
  chatId: string;
  messages: Message[];
  onUpdateMessages: (messages: Message[]) => void;
}

export default function Chat({ chatId, messages, onUpdateMessages }: ChatProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    onUpdateMessages([...messages, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendMessageToWeatherAgent(input);
      const agentMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: res.content,
        timestamp: new Date().toLocaleTimeString(),
      };
      onUpdateMessages([...messages, newMessage, agentMessage]);
    } catch {
      onUpdateMessages([
        ...messages,
        newMessage,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "❌ Error fetching response",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
     
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xl rounded-2xl px-4 py-3  prose ${
                msg.role === "user"
                  ? "bg-gray-100 shadow-md text-gray-900"
                  : "bg-white  text-gray-800"
              }`}
            >
              <p className="whitespace-pre-line font-mono">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
  <div className="flex justify-start">
    <div className="max-w-xs rounded-2xl px-4 py-2 bg-gray-200 text-gray-600 flex space-x-1">
      <span className="animate-pulse">●</span>
      <span className="animate-pulse delay-150">●</span>
      <span className="animate-pulse delay-300">●</span>
    </div>
  </div>
)}
        <div ref={chatEndRef} />
      </div>

     
      <div className="p-4 border-t bg-white">
        <div className="flex items-center bg-gray-100 rounded-2xl px-3 py-2 shadow-sm">
          <input
            type="text"
            placeholder="Type your question..."
            className="flex-1 bg-transparent focus:outline-none px-2 text-gray-800"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-2 py-2 rounded-lg bg-black text-white disabled:opacity-50"
          >
            {loading ? "..." : <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.45435 1.45459H10.5453M10.5453 1.45459V10.5455M10.5453 1.45459L1.45435 10.5455" stroke="#FAFAFA" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
}
          </button>
        </div>
      </div>
    </div>
  );
}
