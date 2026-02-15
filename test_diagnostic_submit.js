
// Native fetch is available in Node 18+

async function testSubmit() {
  console.log("Testing /api/diagnostic/submit...");

  // Mock answers
  const answers = {};
  for(let i=1; i<=50; i++) {
    answers[i] = 4; // All neutral
  }

  try {
    const response = await fetch('http://localhost:3000/api/diagnostic/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Mock session cookie if needed, but the mock client might bypass auth or we rely on the `guest_` fallback in route.ts
        // The route logic checks for session, if not found, it creates a guest user based on undefined session? 
        // Let's check route.ts logic: 
        // "const sessionId = cookieStore.get('zax-session')?.value;"
        // If !sessionId returns 401. 
        // So we MUST provide a cookie.
        'Cookie': 'zax-session=mock_user_id_123' 
      },
      body: JSON.stringify({ answers })
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));

  } catch (error) {
    console.error("Error:", error);
  }
}

testSubmit();
