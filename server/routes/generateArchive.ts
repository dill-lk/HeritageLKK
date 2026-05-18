import { RequestHandler } from "express";

const DEFAULT_TOPIC = "Sri Lankan Heritage";
const getRequestTopic = (req: Parameters<RequestHandler>[0]) =>
  typeof req.body?.topic === "string" ? req.body.topic.trim() : "";

const buildFallbackArchive = (topic: string) => `# ${topic}
## AI GENERATED ARCHIVE
${topic} is a culturally significant part of Sri Lankan heritage, with stories and traditions carried across generations.

### The Heritage
Historical records, oral traditions, and local practices connect ${topic} to wider social, artistic, and spiritual life in Sri Lanka. Its continued preservation helps communities maintain identity, language, and ritual memory.

### Did you know?
Many Sri Lankan heritage traditions were historically preserved through temple chronicles, craft guilds, and family-based knowledge transfer.`;

const writeFallbackArchive = (res: Parameters<RequestHandler>[1], topic: string) => {
  res.status(200).setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(buildFallbackArchive(topic));
};

const tryWriteSseContentLine = (line: string, write: (content: string) => void) => {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data: ") || trimmed === "data: [DONE]") {
    return;
  }

  try {
    const str = trimmed.slice(6);
    const json = JSON.parse(str);
    const content = json.choices?.[0]?.delta?.content;
    if (content) {
      write(content);
    }
  } catch {
    // ignore parse errors for malformed chunks
  }
};

export const handleGenerateArchive: RequestHandler = async (req, res) => {
  try {
    const topic = getRequestTopic(req);
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      console.warn("NVIDIA_API_KEY is not configured. Returning fallback archive content.");
      return writeFallbackArchive(res, topic);
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let response: Response;
    try {
      response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
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
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("NVIDIA API error:", errorText);
      return writeFallbackArchive(res, topic);
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    let wroteAnyContent = false;

    if (response.body && typeof (response.body as any).getReader === "function") {
      const reader = (response.body as any).getReader();
      const decoder = new TextDecoder("utf-8");
      let pending = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        pending += decoder.decode(value, { stream: true });
        const lines = pending.split("\n");
        pending = lines.pop() ?? "";

        for (const line of lines) {
          tryWriteSseContentLine(line, (content) => {
            res.write(content);
            wroteAnyContent = true;
          });
        }
      }

      if (pending) {
        tryWriteSseContentLine(pending, (content) => {
          res.write(content);
          wroteAnyContent = true;
        });
      }
    } else if (response.body) {
      const content = await response.text();
      if (content.trim()) {
        res.write(content);
        wroteAnyContent = true;
      }
    }

    if (!wroteAnyContent) {
      res.write(buildFallbackArchive(topic));
    }
    
    res.end();
  } catch (error) {
    console.error("Generate archive error:", error);
    const topic = getRequestTopic(req) || DEFAULT_TOPIC;
    if (res.headersSent) {
      res.end();
      return;
    }
    writeFallbackArchive(res, topic);
  }
};
