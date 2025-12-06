import { GoogleGenerativeAI } from "@google/generative-ai";

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

export async function classifyLead(text, profession = "freelancer") {
  try {
    const model = client.getGenerativeModel({ model: MODEL });

    const prompt = `
You are an AI classifier. Determine if this email is a real business lead and rate its urgency & intent.

User Profession: ${profession}

────────────────────────────────
🚫 STRICT NON-LEAD (ALWAYS score = 0)
If text contains ANY of these → return:
{
 "urgency": "low",
 "tags": ["promotion"],
 "score": 0,
 "summary": "Not a lead — promotional or automated message."
}

Forbidden terms:
unsubscribe, newsletter, promotional, discount, offer, sale,
OTP, verification code, login alert, authentication,
bank, credit card, debit card, EMI, insurance, statement,
no-reply, noreply, do-not-reply,
transaction alert, billing, invoice auto,
job alert, subscription update,
marketing campaign, bulk message.

DO NOT classify these as leads.

────────────────────────────────
🔍 REAL LEAD CRITERIA  
A message is a lead ONLY if it shows human intent:
• asking for a project / requesting help  
• wants pricing, quotation, proposal  
• describing requirements or goal  
• mentions budget or timeline  
• requests call/meeting/demo  
• shows buying interest  

────────────────────────────────
🔥 ADVANCED URGENCY DETECTION  
Urgency increases if the message contains:

⏳ **Deadline Indicators**
today, tomorrow, next few days,
ASAP, urgent, immediate, right away,
deadline, timeline, this week, before Friday.

📅 **Event-Based Triggers**
event date, exam soon, session scheduled,
campaign launch, product release.

💰 **Budget Signals**
mention of a clear budget → increases seriousness.

📞 **Action Requests**
“call me”, “schedule a meeting”,  
“can we talk”, “please respond soon”.

⏱️ **Follow-up Pressure**
"I need this quickly",  
"how soon can you…",  
"waiting for your reply".

────────────────────────────────
PROFESSION-SPECIFIC URGENCY BOOSTS:

👨‍💻 freelancer  
- urgent if tight deadlines  
- urgent if immediate availability needed  
- urgent if project must start ASAP  
- urgent if client asks “how soon” or “today/tomorrow”

🏢 agency  
- urgent if multi-service request  
- urgent if large project scope  
- urgent if campaign/event deadline  
- urgent if retainer/monthly ongoing work

🏡 real_estate  
- urgent if wants site visit  
- urgent if ready to buy/rent soon  
- urgent if budget & timeline appear clearly  
- urgent if want call back today

🎓 coach  
- urgent if event/exam/session date soon  
- urgent if health/time-based program required  
- urgent if “need sessions immediately”

────────────────────────────────
SCORING RULES:
score 0–30 → weak/unqualified  
score 31–70 → moderate interest  
score 71–100 → strong lead, actionable  

────────────────────────────────
Return ONLY JSON. Do NOT include Markdown or explanations.

Format:
{
  "urgency": "low" | "medium" | "high",
  "tags": ["tag1","tag2"],
  "score": 0-100,
  "summary": "max 25-word summary"
}

TEXT:
${text}
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    return JSON.parse(json);

  } catch (err) {
    console.error("Gemini classify error:", err);
    return { urgency: "unknown", tags: [], score: 0, summary: "" };
  }
}
