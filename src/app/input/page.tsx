import { requireAuth } from '@/lib/auth-check';
import InputClient from './InputClient';

export default async function InputPage() {
  await requireAuth();

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <InputClient />
    </main>
  );
}
