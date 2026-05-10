async function poll() {
  console.log("Starting DB wakeup polling...");
  // Poll for up to 15 minutes (180 attempts * 5 seconds)
  for (let i = 0; i < 180; i++) {
    try {
      const res = await fetch('https://zax.fumiproject.dev/api/migrate');
      const text = await res.text();
      console.log(`[Attempt ${i+1}] Status: ${res.status}, Body: ${text}`);
      
      // If the column was successfully added OR already exists (or query succeeds)
      if (text.includes('"success":true') || text.includes('already exists') || text.includes('duplicate column')) {
        console.log("🎉 SUCCESS: Database migrated and fully awake!");
        return;
      }
    } catch (e) {
      console.log(`[Attempt ${i+1}] Fetch error:`, e.message);
    }
    // Wait 5 seconds
    await new Promise(r => setTimeout(r, 5000));
  }
  console.log("❌ Polling timed out after 15 minutes.");
}
poll();
