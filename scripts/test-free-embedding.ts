import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const freeApiKey = process.env.GOOGLE_API_KEY || ""; // User provided this earlier as the free key
  console.log("Testing Embedding with Key...");

  const genAI = new GoogleGenerativeAI(freeApiKey);
  const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

  try {
    const embeddingResult = await embeddingModel.embedContent("テストテキスト");
    console.log("Success! Embedding length:", embeddingResult.embedding.values.length);
  } catch (error: any) {
    console.error("Embedding Error:", error.message || error);
  }
}

main();
