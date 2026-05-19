import { RequestHandler } from "express";
import OpenAI from "openai";

export const handleGenerateArchive: RequestHandler = async (req, res) => {
  try {
    const topic = typeof req.body?.topic === "string" ? req.body.topic.trim() : "";
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const apiKey = process.env.NVIDIA_API_KEY || "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";

    const prompt = `You are a heritage archivist for Sri Lanka. Generate an engaging archive article about "${topic}".
Format exactly as Markdown with the following structure:
# <A catchy, specific title>
## <A relevant subtitle>
**Location:** <City, Region, Sri Lanka>

<Write a brief engaging introduction here>

### The Heritage
<Write a detailed paragraph about the history and significance.>

### Did you know?
<Write a fascinating historical fact.>`;

    const client = new OpenAI({
      baseURL: "https://integrate.api.nvidia.com/v1",
      apiKey: apiKey
    });

    const completion = await client.chat.completions.create({
      model: "minimaxai/minimax-m2.7",
      messages: [{ role: "user", content: prompt }],
      temperature: 1,
      top_p: 0.95,
      max_tokens: 8192,
      stream: true
    });

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    for await (const chunk of completion) {
      if (!chunk.choices) {
        continue;
      }
      if (chunk.choices[0]?.delta?.content != null) {
        res.write(chunk.choices[0].delta.content);
      }
    }
    
    res.end();
  } catch (error) {
    console.error("Generate archive error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
