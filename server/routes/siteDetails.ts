import { RequestHandler } from "express";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Using dummy client.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

const buildFallbackSiteDetails = (siteName: string) => ({
  description: `${siteName} is a notable Sri Lankan heritage location with cultural and historical value.`,
  status: "Check local visiting hours",
  ticketPrice: "Varies by visitor type",
  bestTimeToVisit: "Morning or late afternoon",
});

export const handleSiteDetails: RequestHandler = async (req, res) => {
  try {
    const siteName = req.query.name as string;

    if (!siteName) {
      res.status(400).json({ error: "Site name is required" });
      return;
    }

    const prompt = `Provide practical details for a tourist visiting "${siteName}". 
Respond ONLY with a JSON object in the exact following format:
{
  "description": "A short, engaging 1-2 sentence description.",
  "status": "e.g., Open, Closed, Open 24/7",
  "ticketPrice": "e.g., Free, $5, 1000 LKR",
  "bestTimeToVisit": "e.g., Morning, Evening"
}
Ensure the JSON is valid and can be directly parsed. No markdown fences.`;

    const ai = getAIClient();
    if (!ai) {
      return res.json(buildFallbackSiteDetails(siteName));
    }

    const generationPromise = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    const response = await Promise.race([
      generationPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Site details generation timed out")), 15000),
      ),
    ]);

    const resultText = response.text || "{}";
    let details;
    try {
      details = JSON.parse(resultText.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (e) {
      console.error("Failed to parse Gemini response", resultText);
      details = {
        ...buildFallbackSiteDetails(siteName),
      };
    }

    res.json(details);
  } catch (error) {
    console.error("Error fetching site details:", error);
    const siteName =
      typeof req.query.name === "string" && req.query.name.trim()
        ? req.query.name.trim()
        : "this heritage site";
    res.json(buildFallbackSiteDetails(siteName));
  }
};
