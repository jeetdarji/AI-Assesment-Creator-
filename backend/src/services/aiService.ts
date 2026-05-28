import Groq from "groq-sdk";
import { GeneratedOutput } from "../types/output";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

if (!GROQ_API_KEY) {
  console.error("\x1b[31m[Groq] GROQ_API_KEY is not defined in environment.\x1b[0m");
}

const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function parseAIResponse(rawText: string): GeneratedOutput {
  const cleaned = rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Find first { and last } to extract clean JSON substring
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error("Could not find a valid JSON object in AI response.");
  }

  const jsonStr = cleaned.substring(firstBrace, lastBrace + 1);

  let parsed: GeneratedOutput;
  try {
    parsed = JSON.parse(jsonStr) as GeneratedOutput;
  } catch (parseError) {
    console.error("[Groq] Failed to parse response JSON:", jsonStr.substring(0, 500));
    throw new Error("AI response was not valid JSON. Please retry.");
  }

  if (!parsed.sections || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
    throw new Error("AI response missing required 'sections' field.");
  }
  if (!parsed.answerKey || !Array.isArray(parsed.answerKey)) {
    throw new Error("AI response missing required 'answerKey' field.");
  }

  // Validate and fix difficulty levels
  const validDifficulties = ["Easy", "Moderate", "Hard"];
  parsed.sections.forEach(section => {
    if (section.questions && Array.isArray(section.questions)) {
      section.questions.forEach(q => {
        if (!validDifficulties.includes(q.difficulty)) {
          q.difficulty = "Moderate";
        }
      });
    }
  });

  return parsed;
}

export async function generateAssessment(prompt: string): Promise<GeneratedOutput> {
  if (!groq) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an expert Indian school teacher and curriculum designer. You always respond with only valid JSON — no markdown, no backticks, no explanation text, just the raw JSON object."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      });

      const rawText = response.choices[0]?.message?.content;
      if (!rawText || rawText.trim() === "") {
        throw new Error("Empty response from Groq");
      }

      if (process.env.NODE_ENV !== "production") {
        console.log(`[Groq] Generation successful, tokens used: ${response.usage?.total_tokens}`);
      }
      
      return parseAIResponse(rawText);
    } catch (error: any) {
      console.error(`[Groq] Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === maxAttempts) {
        throw error;
      }

      const status = error.status || (error.response && error.response.status);
      
      if (status === 429) {
        // Rate limit: wait 10 seconds before retry
        console.log("[Groq] Rate limit hit (429). Waiting 10s...");
        await wait(10000);
      } else if (status === 503) {
        // Unavailable: wait 5 seconds before retry
        console.log("[Groq] Service unavailable (503). Waiting 5s...");
        await wait(5000);
      } else {
        // For other API errors, throw immediately if it's not a temporary network issue
        // But for resilience in this script, we'll use standard exponential backoff if it's a parsing error or generic error
        if (error.message.includes("valid JSON") || error.message.includes("Empty response")) {
           const delay = attempt * 2000;
           console.log(`[Groq] Retrying in ${delay}ms...`);
           await wait(delay);
        } else {
           throw error;
        }
      }
    }
  }

  throw new Error("Failed to generate assessment after maximum attempts.");
}
