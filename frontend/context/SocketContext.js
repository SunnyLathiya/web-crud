'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(() => new Set());
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      setSocket(null);
      setConnected(false);
      setOnlineUsers(new Set());
      return undefined;
    }

    const token = localStorage.getItem('token');
    const nextSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
    });

    const onSnapshot = (ids) => setOnlineUsers(new Set((ids || []).map(String)));
    const onPresence = ({ userId: presenceId, online }) => {
      setOnlineUsers((current) => {
        const next = new Set(current);
        if (online) next.add(String(presenceId));
        else next.delete(String(presenceId));
        return next;
      });
    };
    const onBlocked = () => {
      localStorage.removeItem('token');
      window.location.href = '/login?blocked=1';
    };
    const onConnectError = (error) => {
      if (error.message === 'BLOCKED') onBlocked();
    };

    nextSocket.on('connect', () => setConnected(true));
    nextSocket.on('disconnect', () => setConnected(false));
    nextSocket.on('presence:snapshot', onSnapshot);
    nextSocket.on('presence:update', onPresence);
    nextSocket.on('account:blocked', onBlocked);
    nextSocket.on('connect_error', onConnectError);

    setSocket(nextSocket);

    return () => {
      nextSocket.off('connect');
      nextSocket.off('disconnect');
      nextSocket.off('presence:snapshot', onSnapshot);
      nextSocket.off('presence:update', onPresence);
      nextSocket.off('account:blocked', onBlocked);
      nextSocket.off('connect_error', onConnectError);
      nextSocket.disconnect();
      setSocket(null);
      setConnected(false);
      setOnlineUsers(new Set());
    };
  }, [userId]);

  const isOnline = useCallback((id) => onlineUsers.has(String(id)), [onlineUsers]);

  const value = useMemo(
    () => ({ socket, connected, isOnline }),
    [socket, connected, isOnline]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
}
