import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const freeApiKey = "AIzaSyDxbZpz9eXIm6etTNVupJsugZaDGAy4M2I"; // User provided this earlier as the free key
  console.log("Testing Embedding with FREE Key:", freeApiKey.slice(0, 10) + "...");

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
