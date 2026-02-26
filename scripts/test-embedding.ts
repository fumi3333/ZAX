import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY || "";
  console.log("Testing Embedding with Key:", apiKey.slice(0, 10) + "...");

  const genAI = new GoogleGenerativeAI(apiKey);
  const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

  try {
    const embeddingResult = await embeddingModel.embedContent("テストテキスト");
    console.log("Success! Embedding length:", embeddingResult.embedding.values.length);
  } catch (error: any) {
    console.error("Embedding Error:", error.message || error);
  }
}

main();
