import { GoogleGenAI } from "@google/genai";
import { RequestHandler } from "express";

const DEFAULT_TOPIC = "Sri Lankan Heritage";
const GEMINI_TIMEOUT_MS = 15000;
const NVIDIA_TIMEOUT_MS = 20000;
const PLACEHOLDER_MARKERS = [
  "Write a brief engaging introduction.",
  "Write a detailed paragraph about the history and significance.",
  "Write a fascinating historical fact.",
];

let geminiClient: GoogleGenAI | null = null;

const getRequestTopic = (req: Parameters<RequestHandler>[0]) =>
  typeof req.body?.topic === "string" ? req.body.topic.trim() : "";

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  return geminiClient;
};

const buildFallbackArchive = (topic: string) => `# ${topic}
## AI GENERATED ARCHIVE
${topic} carries layers of memory, place, and tradition within Sri Lanka's cultural landscape. Stories about ${topic} survive through local practice, family knowledge, and the way communities continue to speak about it today.

### The Heritage
Historical records, oral traditions, and everyday community practices connect ${topic} to Sri Lanka's wider artistic, social, and spiritual life. Whether preserved through ritual, craft, storytelling, or regional identity, ${topic} reflects how heritage is carried forward not only in monuments, but in living memory. Its continued preservation helps communities maintain identity, strengthen intergenerational ties, and protect knowledge that might otherwise disappear.

### Did you know?
Many Sri Lankan heritage traditions were historically preserved through temple chronicles, village storytellers, artisan lineages, and family-based knowledge transfer rather than a single written archive.`;

const normalizeArchiveMarkdown = (text: string, topic: string) => {
  const normalized = text.replace(/```markdown/g, "").replace(/```/g, "").trim();
  const hasPlaceholderContent = PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker));

  if (!normalized || hasPlaceholderContent) {
    return buildFallbackArchive(topic);
  }

  return normalized;
};

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

const generateWithGemini = async (topic: string) => {
  const ai = getGeminiClient();
  if (!ai) {
    return null;
  }

  const prompt = `You are a heritage archivist for Sri Lanka. Write a polished archive article about "${topic}".

Return plain Markdown only. Do not include code fences. Do not repeat these instructions. Do not use placeholder sentences.

Required structure:
# ${topic}
## AI GENERATED ARCHIVE
Write one vivid introductory paragraph about the place, tradition, or subject.

### The Heritage
Write one substantial paragraph explaining the history, cultural significance, and Sri Lankan context.

### Did you know?
Write one interesting fact as a short paragraph.

Every section must contain finished content, not instructions.`;

  const generationPromise = ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      temperature: 0.7,
    },
  });

  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    const response = await Promise.race([
      generationPromise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Archive generation timed out")), GEMINI_TIMEOUT_MS);
      }),
    ]);

    return normalizeArchiveMarkdown(response.text || "", topic);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
};

const generateWithNvidia = async (topic: string) => {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return null;
  }

  const prompt = `You are a heritage archivist for Sri Lanka. Write a polished archive article about "${topic}".
Return plain Markdown only with completed prose, not instructions.

# ${topic}
## AI GENERATED ARCHIVE
Intro paragraph.

### The Heritage
Detailed historical and cultural paragraph.

### Did you know?
One interesting fact paragraph.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NVIDIA_TIMEOUT_MS);

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "minimaxai/minimax-m2.7",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2048,
        stream: true
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("NVIDIA API error:", errorText);
      return null;
    }

    let content = "";

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
          tryWriteSseContentLine(line, (chunk) => {
            content += chunk;
          });
        }
      }

      if (pending) {
        tryWriteSseContentLine(pending, (chunk) => {
          content += chunk;
        });
      }
    } else if (response.body) {
      content = await response.text();
    }

    return normalizeArchiveMarkdown(content, topic);
  } finally {
    clearTimeout(timeout);
  }
};

export const handleGenerateArchive: RequestHandler = async (req, res) => {
  try {
    const topic = getRequestTopic(req);
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const content = (await generateWithGemini(topic)) ?? (await generateWithNvidia(topic)) ?? buildFallbackArchive(topic);
    res.status(200).setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(content);
  } catch (error) {
    console.error("Generate archive error:", error);
    const topic = getRequestTopic(req) || DEFAULT_TOPIC;
    writeFallbackArchive(res, topic);
  }
};
