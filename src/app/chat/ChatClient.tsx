'use client';

import BlindChat from '@/components/BlindChat';
import { useRouter } from 'next/navigation';

export default function ChatClient() {
  const router = useRouter();

  const handleEndChat = () => {
    // Navigate back to home or dashboard
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Background (Light Mode) */}
        <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-100/50 rounded-full blur-[100px] mix-blend-multiply" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
        </div>

       <div className="relative z-10 w-full max-w-2xl">
            <BlindChat onEndChat={handleEndChat} />
       </div>
    </div>
  );
}
