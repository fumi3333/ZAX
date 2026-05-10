async function poll() {
  console.log("Polling Vercel for migration endpoint...");
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('https://zax.fumiproject.dev/api/migrate');
      if (res.status === 200 || res.status === 500) {
        const text = await res.text();
        console.log("Result:", res.status, text);
        // If 500, it might mean the column already exists or Prisma threw an error. 
        // We'll see.
        if (text.includes('success')) {
           return;
        }
      } else {
        console.log("Status:", res.status);
      }
    } catch (e) {
      console.log("Error:", e.message);
    }
    await new Promise(r => setTimeout(r, 5000));
  }
}
poll();
