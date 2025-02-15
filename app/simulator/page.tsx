'use client'
import React, { useState } from 'react';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const App = () => {
  const [response, setResponse] = useState<string>('');

  const fetchData = async () => {
    const completion = await openai.chat.completions.create({
      model: "deepseek-ai/deepseek-r1",
      messages: [{"role":"user","content":"Which number is larger, 9.11 or 9.8?"}],
      temperature: 0.6,
      top_p: 0.7,
      max_tokens: 4096,
      stream: true
    });

    let result = '';
    for await (const chunk of completion) {
      result += chunk.choices[0]?.delta?.content || '';
    }
    setResponse(result);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>OpenAI Response</h1>
      <button onClick={fetchData} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Fetch Data
      </button>
      <div style={{ marginTop: '20px', whiteSpace: 'pre-wrap', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
        {response}
      </div>
    </div>
  );
};

export default App;
