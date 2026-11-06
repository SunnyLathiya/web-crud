'use client';

import ThemeRegistry from './ThemeRegistry';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';

export default function Providers({ children }) {
  return (
    <ThemeRegistry>
      <AuthProvider>
        <SocketProvider>{children}</SocketProvider>
      </AuthProvider>
    </ThemeRegistry>
  );
}
