import { requireAuth } from '@/lib/auth-check';
import ChatClient from './ChatClient';

export default async function ChatPage() {
  await requireAuth();

  return <ChatClient />;
}
