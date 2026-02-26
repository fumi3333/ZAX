import 'dotenv/config';

async function main() {
  const apiKey = "AIzaSyCS8jk2btlLVzxxUtuSCDbP85in4U8vaBA";
  console.log("Testing PAID API Key: AIzaSyC...vaBA");

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("API Error Response:", JSON.stringify(data.error, null, 2));
    } else {
      console.log("Success! Total models found:", data.models.length);
      console.log("Available models (first 5):", data.models.slice(0, 5).map((m: any) => m.name));
      
      const has15Flash = data.models.some((m: any) => m.name === 'models/gemini-1.5-flash');
      const has25Flash = data.models.some((m: any) => m.name === 'models/gemini-2.5-flash');
      
      console.log("Supports gemini-1.5-flash:", has15Flash);
      console.log("Supports gemini-2.5-flash:", has25Flash);

      // Try a real generation test
      const targetModel = has25Flash ? "gemini-2.5-flash" : (has15Flash ? "gemini-1.5-flash" : "gemini-pro");
      console.log(`Attempting generation with: ${targetModel}`);
      
      const genResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
      });
      const genData = await genResponse.json();
      if (genData.error) {
          console.error("Generation failed:", JSON.stringify(genData.error, null, 2));
      } else {
          console.log("Generation success!");
      }
    }
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

main();
