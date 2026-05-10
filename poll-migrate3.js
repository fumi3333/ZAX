async function poll() {
  console.log("Polling Vercel for migration endpoint...");
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('https://zax.fumiproject.dev/api/migrate');
      const text = await res.text();
      console.log("Status:", res.status, "Body:", text);
      if (text.includes('success":true') || text.includes('already exists')) {
        console.log("Migration successful!");
        return;
      }
    } catch (e) {
      console.log("Error:", e.message);
    }
    await new Promise(r => setTimeout(r, 5000));
  }
}
poll();
