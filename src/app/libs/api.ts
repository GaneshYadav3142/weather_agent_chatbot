// lib/api.ts
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface WeatherAgentResponse {
  content: string;
}

const API_URL =
  "https://millions-screeching-vultur.mastra.cloud/api/agents/weatherAgent/stream";

export async function sendMessageToWeatherAgent(
  message: string
): Promise<WeatherAgentResponse> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8,fr;q=0.7",
        Connection: "keep-alive",
        "Content-Type": "application/json",
        "x-mastra-dev-playground": "true",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        runId: "weatherAgent",
        maxRetries: 2,
        maxSteps: 5,
        temperature: 0.5,
        topP: 1,
        runtimeContext: {},
        threadId: "F1001", 
        resourceId: "weatherAgent",
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body from API");

    const decoder = new TextDecoder("utf-8");
    let finalText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

  
      const matches = [...chunk.matchAll(/0:"([^"]*)"/g)];
      for (const match of matches) {
        finalText += match[1];
      }
    }

    return { content: finalText.trim() };
  } catch (error) {
    console.error("Error calling weather agent:", error);
    throw error;
  }
}
