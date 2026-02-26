import 'dotenv/config';

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY || "";
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
        data.models.forEach((m: any) => {
            if (m.name.includes("embed")) {
                console.log(m.name);
            }
        });
        
        console.log("-------------------");
        // Print all embedding models to figure out if it's text-embedding-004
        const textEmbedModels = data.models.filter((m: any) => m.name.includes("text-embedding"));
        console.log("text embedding models:", textEmbedModels.map((m:any) => m.name));
    }
  } catch (e) {
    console.error(e);
  }
}

main();
