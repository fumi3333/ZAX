import { GoogleGenerativeAI } from "@google/generative-ai";

// User provided key - manually injecting for verification test
const API_KEY = "AIzaSyAvWD5J97pkAeo4p3n2SvUAWXEhxwAuXOg";

async function verify() {
    console.log("🟡 Testing API Key connectivity...");
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = "Explain the concept of 'Resonance' in 1 short sentence.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("✅ API Key SUCCESS!");
        console.log("🤖 Gemini Response:", text);
    } catch (error) {
        console.error("❌ API Key FAILED:");
        console.error(error);
        process.exit(1);
    }
}

verify();
