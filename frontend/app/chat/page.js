import Protected from '@/components/Protected';
import ChatWorkspace from '@/components/chat/ChatWorkspace';

export const metadata = { title: 'Chat' };

export default function ChatPage() {
  return (
    <Protected>
      <ChatWorkspace />
    </Protected>
  );
}
