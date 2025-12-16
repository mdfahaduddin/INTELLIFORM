import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const API_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
].filter(Boolean);

let currentKeyIndex = 0;

function getNextKey() {
  if (API_KEYS.length === 0) {
    throw new Error(
      "No Groq API keys configured. Please add GROQ_API_KEY to your .env file"
    );
  }
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

export async function generateContent(prompt) {
  let lastError;
  let attempts = 0;
  const maxAttempts = API_KEYS.length;

  while (attempts < maxAttempts) {
    try {
      const apiKey = getNextKey();
      const groq = new Groq({ apiKey });

      console.log(`🚀 Attempting with API key ${attempts + 1}/${maxAttempts}`);

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a data extraction expert. Extract structured information from text and return ONLY valid JSON. Do not include markdown code blocks, explanations, or any text outside the JSON object.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        // Alternative models:
        // "llama-3.3-70b-versatile" - More powerful, better accuracy
        // "mixtral-8x7b-32768" - Large context window (32k tokens)
        // "gemma2-9b-it" - Good balance of speed and quality
        temperature: 0.1,
        max_tokens: 2048,
        top_p: 0.95,
        stream: false,
      });

      const responseText = completion.choices[0]?.message?.content || "";

      if (!responseText) {
        throw new Error("Empty response from Groq API");
      }

      console.log(
        `✅ Successfully generated content with Groq (API key ${attempts + 1})`
      );
      console.log(`📊 Tokens used: ${completion.usage?.total_tokens || "N/A"}`);

      return responseText;
    } catch (error) {
      lastError = error;
      attempts++;

      console.error(`❌ API Key ${attempts} failed:`, error.message);

      // Handle rate limit errors
      if (
        error.message.includes("429") ||
        error.message.includes("rate_limit") ||
        error.message.includes("Rate limit")
      ) {
        console.log(`⏳ Rate limit hit, trying next API key...`);

        if (attempts < maxAttempts) {
          continue; // Try next key
        } else {
          throw new Error(
            "All API keys have hit rate limits. Please try again in a few minutes."
          );
        }
      }

      // Handle authentication errors
      if (
        error.message.includes("401") ||
        error.message.includes("Invalid API key") ||
        error.message.includes("authentication")
      ) {
        console.log(`🔑 Invalid API key, trying next one...`);

        if (attempts < maxAttempts) {
          continue; // Try next key
        } else {
          throw new Error(
            "All API keys are invalid. Please check your Groq API keys in .env file."
          );
        }
      }

      // Handle service unavailable errors
      if (
        error.message.includes("503") ||
        error.message.includes("Service Unavailable")
      ) {
        console.log(`🔄 Service unavailable, trying next API key...`);

        if (attempts < maxAttempts) {
          continue; // Try next key
        } else {
          throw new Error(
            "Groq service is temporarily unavailable. Please try again later."
          );
        }
      }
      throw error;
    }
  }

  throw lastError || new Error("Failed to generate content with Groq API");
}

export const API_KEYS_COUNT = API_KEYS.length;

console.log(`🔑 Groq Client initialized with ${API_KEYS_COUNT} API key(s)`);
console.log(`📈 Rate limit capacity: ${API_KEYS_COUNT * 30} requests/minute`);
