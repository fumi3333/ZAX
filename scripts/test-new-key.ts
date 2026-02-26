import 'dotenv/config';

async function main() {
  const apiKey = "AIzaSyDxbZpz9eXIm6etTNVupJsugZaDGAy4M2I";
  console.log("Testing API Key: AIzaSyD...y4M2I");

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("API Error Response:", JSON.stringify(data.error, null, 2));
    } else {
      console.log("Success! Available models (first 3):", data.models.slice(0, 3).map((m: any) => m.name));
      // Try a simple generateContent to check if it's really active
      const genResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
      });
      const genData = await genResponse.json();
      if (genData.error) {
          console.error("GenerateContent Error:", JSON.stringify(genData.error, null, 2));
      } else {
          console.log("GenerateContent Success!");
      }
    }
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

main();
