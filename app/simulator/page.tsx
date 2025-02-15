'use client'
import React, { useState } from 'react';
import { Loader2 } from "lucide-react";

const ChatComponent = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }]
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      // Read the response as a stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Decode the chunk and add it to our buffer
        buffer += decoder.decode(value, { stream: true });

        // Split on double newlines, which separate SSE messages
        const parts = buffer.split('\n\n');
        
        // Process all complete messages
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i].trim();
          if (part.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(part.slice(6)); // Remove 'data: ' prefix
              const content = jsonData.choices[0]?.delta?.content || '';
              setResponse(prev => prev + content);
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
        
        // Keep the last partial message in the buffer
        buffer = parts[parts.length - 1];
      }

    } catch (error) {
      console.error("Fetch Error:", error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">NVIDIA AI Chat</h1>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32 text-black"
          />
          
          <button 
            onClick={handleSubmit} 
            disabled={isLoading || !input.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              'Send Message'
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {(response || isLoading) && (
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-800 min-h-[100px]">
            {response || (isLoading && <Loader2 className="h-4 w-4 animate-spin" />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;