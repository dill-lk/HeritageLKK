import { RequestHandler } from "express";

export const handleGenerateArchive: RequestHandler = async (req, res) => {
  try {
    const { topic } = req.body;

    const apiKey = "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";
    if (!apiKey) {
      return res.status(500).json({ error: "NVIDIA API key not set" });
    }

    const prompt = `You are a heritage archivist for Sri Lanka. Generate an engaging archive article about "${topic}".
Format as Markdown with the following structure:
# Title
## Subtitle
Write a brief engaging introduction.
### The Heritage
Write a detailed paragraph about the history and significance.
### Did you know?
Write a fascinating historical fact.`;

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "minimaxai/minimax-m2.7",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        top_p: 0.9,
        max_tokens: 2048,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("NVIDIA API error:", errorText);
      return res.status(500).json({ error: "Failed to generate archive" });
    }

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    if (response.body) {
      const reader = (response.body as any).getReader();
      const decoder = new TextDecoder("utf-8");
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
            try {
              const str = line.slice(6);
              const json = JSON.parse(str);
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                res.write(content);
              }
            } catch(e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }
    }
    
    res.end();
  } catch (error) {
    console.error("Generate archive error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
