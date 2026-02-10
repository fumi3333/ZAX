'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function manualLogin(prevState: string | undefined, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!email || !password) {
    return 'Please fill in all fields.';
  }

  // Domain Check (Mock Logic)
  if (email.endsWith('musashino-u.ac.jp') || email.endsWith('gmail.com')) {
      // Set Mock Session Cookie
      (await cookies()).set('zax-session', 'mock-session-token-12345', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
      });
      
      redirect('/input');
  }

  return 'Invalid email domain. Must be @musashino-u.ac.jp';
}

export async function manualRegister(prevState: string | undefined, formData: FormData) {
    const email = formData.get('email') as string;
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (email.endsWith('musashino-u.ac.jp')) {
         (await cookies()).set('zax-session', 'mock-session-token-12345', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
      });
      redirect('/input');
    }
    
    return 'Invalid email domain. Must be @musashino-u.ac.jp';
}

export async function manualLogout() {
    (await cookies()).delete('zax-session');
    // Also clear analysis result
    (await cookies()).delete('zax-analysis-result');
    redirect('/login');
}

export async function saveAnalysisResult(data: any) {
    // Simulate Analysis Delay if called directly, but usually called from client after delay
    (await cookies()).set('zax-analysis-result', JSON.stringify(data), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });
}
