import { GoogleGenerativeAI } from "@google/generative-ai";

const KEYS = [
  process.env.GEMINI_KEY_1,
  process.env.GEMINI_KEY_2,
  process.env.GEMINI_KEY_3,
  process.env.GEMINI_KEY_4,
  process.env.GEMINI_KEY_5,
].filter(Boolean);

let pointer = 0;

function getNextKey() {
  const key = KEYS[pointer];
  pointer = (pointer + 1) % KEYS.length;
  return key;
}

export async function classifyLeadWithRotation(text) {
  const apiKey = getNextKey();
  if (!apiKey) {
    console.error("❌ No Gemini API keys configured");
    return { urgency: "unknown", tags: [], score: 0, summary: "" };
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    });

    const prompt = `
Return ONLY pure JSON. No explanation.

{
 "urgency": "low" | "medium" | "high",
 "tags": [],
 "score": 0-100,
 "summary": "25-word summary"
}

Analyze this lead:

${text}
`;


    const result = await model.generateContent(prompt);

    const raw = result.response.text();

    const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);

    console.log("📦 Extracted JSON:\n", json);

    const parsed = JSON.parse(json);

    console.log("\n🎯 FINAL PARSED AI RESULT:", parsed);

    return parsed;

  } catch (err) {
    console.error("\n❌ GEMINI ERROR DETAILS:");
    console.error(err);

    return { urgency: "unknown", tags: [], score: 0, summary: "" };
  }
}
