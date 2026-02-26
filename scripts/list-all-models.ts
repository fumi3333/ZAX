import 'dotenv/config';

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY || "";
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
        console.log("All available models:");
        data.models.forEach((m: any) => {
            console.log(m.name);
        });
    }
  } catch (e) {
    console.error(e);
  }
}

main();
