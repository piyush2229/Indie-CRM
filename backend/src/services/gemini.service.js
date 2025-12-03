import { GoogleGenerativeAI } from "@google/generative-ai";

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// model name must be valid for your key
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
export async function classifyLead(text) {
  try {
    const model = client.getGenerativeModel({ model: MODEL });

    const prompt = `
You are a lead classifier. Analyze the following text and return JSON only.
Return EXACTLY this structure:

{
 "urgency": "low|medium|high",
 "tags": ["tag1","tag2"],
 "score": 0-100,
 "summary": "short 25-word summary"
}

Rules:
- Output ONLY raw JSON.
- No backticks.
- No markdown.
- No explanations.
- No surrounding text.

TEXT:
${text}
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    // Extract JSON safely
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    const jsonStr = raw.slice(jsonStart, jsonEnd + 1).trim();

    return JSON.parse(jsonStr);

  } catch (err) {
    console.error("Gemini classify error:", err);
    return {
      urgency: "unknown",
      tags: [],
      score: 0,
      summary: ""
    };
  }
}
