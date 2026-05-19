import { RequestHandler } from "express";
import OpenAI from "openai";
import { getProviderApiKey } from "../lib/providerApiKeys";

type ChatMessageRole = "user" | "assistant";

type ChatMessage = {
  role: ChatMessageRole;
  content: string;
};

type ChatCompletionMessage = ChatMessage | {
  role: "system";
  content: string;
};

const isValidChatMessage = (message: unknown): message is ChatMessage =>
{
  if (!message || typeof message !== "object") {
    return false;
  }

  const candidate = message as { role?: unknown; content?: unknown };
  const hasValidRole = candidate.role === "user" || candidate.role === "assistant";
  const hasValidContent = typeof candidate.content === "string" && candidate.content.trim().length > 0;

  return hasValidRole && hasValidContent;
};

export const handleShingoChat: RequestHandler = async (req, res) => {
  try {
    const rawMessages = req.body?.messages;
    const rawMessage = req.body?.message;

    let messages: ChatMessage[] | null = null;
    if (Array.isArray(rawMessages)) {
      const validMessages = rawMessages.filter(isValidChatMessage);
      if (validMessages.length !== rawMessages.length) {
        return res.status(400).json({
          error: "All messages must include role ('user' or 'assistant') and non-empty content",
        });
      }

      messages = validMessages.map(
        (message): ChatMessage => ({
          role: message.role,
          content: message.content.trim(),
        }),
      );
    } else if (typeof rawMessage === "string" && rawMessage.trim()) {
      messages = [{ role: "user", content: rawMessage.trim() }];
    } else if (
      rawMessage &&
      typeof rawMessage === "object" &&
      typeof rawMessage.content === "string" &&
      rawMessage.content.trim()
    ) {
      if (
        rawMessage.role !== undefined &&
        rawMessage.role !== "user" &&
        rawMessage.role !== "assistant"
      ) {
        return res.status(400).json({
          error: "Message role must be 'user' or 'assistant' when provided",
        });
      }
      messages = [
        {
          role: rawMessage.role === "assistant" ? "assistant" : "user",
          content: rawMessage.content.trim(),
        },
      ];
    }

    if (!messages) {
      return res.status(400).json({ error: "Valid message or messages array is required" });
    }

    if (messages.length === 0) {
      return res.status(400).json({ error: "At least one valid message is required" });
    }

    const apiKey = await getProviderApiKey("nvidia");

    const systemPrompt = "You are Shingo AI, an expert on Sri Lankan heritage, culture, historical context, entry fees, weather, and directions to specific sites. Provide concise, helpful, and friendly answers.";
    
    const formattedMessages: ChatCompletionMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
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
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
};
