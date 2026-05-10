const { Client } = require('pg');
async function test() {
  const client = new Client({
    connectionString: "postgresql://postgres.sqejheryiyeqqejkmvkb:DAiErBNcX3LA5RDU@db.sqejheryiyeqqejkmvkb.supabase.co:6543/postgres?sslmode=require"
  });
  try {
    await client.connect();
    console.log("Connected!");
    await client.end();
  } catch(e) {
    console.error("Connection Error:", e.message);
  }
}
test();
