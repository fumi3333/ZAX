import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY || "";
  console.log("Testing Embedding with PAID Key:", apiKey.slice(0, 10) + "...");

  const genAI = new GoogleGenerativeAI(apiKey);
  const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });

  try {
    const embeddingResult = await embeddingModel.embedContent("テストテキスト");
    console.log("Success! label: embedding-001 length:", embeddingResult.embedding.values.length);
  } catch (error: any) {
    console.error("Embedding Error (embedding-001):", error.message || error);
  }

  const embeddingModelText004 = genAI.getGenerativeModel({ model: "text-embedding-004" });
  try {
    const embeddingResult = await embeddingModelText004.embedContent("テストテキスト");
    console.log("Success! label: text-embedding-004 length:", embeddingResult.embedding.values.length);
  } catch (error: any) {
    console.error("Embedding Error (text-embedding-004):", error.message || error);
  }
}

main();
