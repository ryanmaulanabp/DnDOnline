const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const { GoogleGenerativeAI } = require('@google/generative-ai');

const systemPrompt = "Kamu adalah DM D&D. Berikan respon 1 kalimat petualangan.";
const playerAction = "Saya membuka pintu tavern.";
const timeoutMs = 10000;

// Test Gemini
async function testGemini() {
  console.log("\n--- Testing Provider 1: Gemini ---");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No GEMINI_API_KEY");
    return;
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const res = await model.generateContent(playerAction);
    console.log("Success! Gemini response:", res.response.text().trim());
  } catch (err) {
    console.error("Gemini failed:", err.message || err);
  }
}

// Test Groq
async function testGroq() {
  console.log("\n--- Testing Provider 2: Groq ---");
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.log("No GROQ_API_KEY");
    return;
  }
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: playerAction }
        ],
        max_tokens: 100,
      }),
    });
    if (!response.ok) {
      console.log(`Groq HTTP error! status: ${response.status}`, await response.text());
      return;
    }
    const data = await response.json();
    console.log("Success! Groq response:", data.choices?.[0]?.message?.content?.trim());
  } catch (err) {
    console.error("Groq failed:", err.message || err);
  }
}

// Test OpenRouter
async function testOpenRouter() {
  console.log("\n--- Testing Provider 3: OpenRouter ---");
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.log("No OPENROUTER_API_KEY");
    return;
  }
  try {
    const models = [
      "meta-llama/llama-3.3-70b-instruct",
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemini-2.5-flash",
      "google/gemini-2.0-flash-lite:preview"
    ];
    for (const model of models) {
      console.log(`Testing OpenRouter model: ${model}`);
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "DnD Online",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: playerAction }
          ],
          max_tokens: 50,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(`Success with OpenRouter ${model}:`, data.choices?.[0]?.message?.content?.trim());
        break;
      } else {
        console.log(`OpenRouter ${model} failed! status: ${response.status}`, await response.text());
      }
    }
  } catch (err) {
    console.error("OpenRouter failed:", err.message || err);
  }
}

// Test Cohere
async function testCohere() {
  console.log("\n--- Testing Provider 4: Cohere ---");
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    console.log("No COHERE_API_KEY");
    return;
  }
  try {
    const models = [
      "command-r",
      "command-r7b-12-2024",
      "command"
    ];
    for (const model of models) {
      console.log(`Testing Cohere model: ${model}`);
      const response = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          preamble: systemPrompt,
          message: playerAction,
          max_tokens: 50,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(`Success with Cohere ${model}:`, data.text?.trim());
        break;
      } else {
        console.log(`Cohere ${model} failed! status: ${response.status}`, await response.text());
      }
    }
  } catch (err) {
    console.error("Cohere failed:", err.message || err);
  }
}

async function runTests() {
  await testGemini();
  await testGroq();
  await testOpenRouter();
  await testCohere();
  console.log("\nAll tests run complete.");
}

runTests();
