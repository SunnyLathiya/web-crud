'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (adminOnly && user.role !== 'admin') router.replace('/chat');
  }, [adminOnly, loading, router, user]);

  if (loading || !user || (adminOnly && user.role !== 'admin')) {
    return <LoadingScreen />;
  }

  return children;
}
