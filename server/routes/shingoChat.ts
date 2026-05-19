import { RequestHandler } from "express";
import OpenAI from "openai";
import { getProviderApiKey } from "../lib/providerApiKeys";

export const handleShingoChat: RequestHandler = async (req, res) => {
  try {
    const messages = req.body?.messages;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const apiKey = await getProviderApiKey("nvidia");

    const systemPrompt = "You are Shingo AI, an expert on Sri Lankan heritage, culture, historical context, entry fees, weather, and directions to specific sites. Provide concise, helpful, and friendly answers.";
    
    const formattedMessages: any = [
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({ 
        role: m.role === 'user' ? 'user' : 'assistant', 
        content: m.content 
      }))
    ];

    const client = new OpenAI({
      baseURL: "https://integrate.api.nvidia.com/v1",
      apiKey: apiKey
    });

    const completion = await client.chat.completions.create({
      model: "minimaxai/minimax-m2.7", // Using the same model as generateArchive
      messages: formattedMessages,
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 1024,
      stream: true
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    for await (const chunk of completion) {
      if (!chunk.choices) {
        continue;
      }
      if (chunk.choices[0]?.delta?.content != null) {
        res.write(chunk.choices[0].delta.content);
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      }
    }
    
    res.end();
  } catch (error) {
    console.error("Shingo AI chat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
