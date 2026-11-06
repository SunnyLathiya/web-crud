'use client';

import { useRouter, usePathname } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useAuth } from '@/context/AuthContext';
import Logo from './Logo';

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  const links = [
    { href: '/chat', label: 'Chat' },
    ...(user?.role === 'admin' ? [{ href: '/admin', label: 'Dashboard' }] : []),
  ];

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ gap: 1 }}>
        <Logo size={32} />
        <Typography variant="h6" sx={{ fontFamily: 'var(--font-display), Georgia, serif', mr: 1 }}>
          WebChat
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
          {links.map((link) => (
            <Button
              key={link.href}
              color="inherit"
              onClick={() => router.push(link.href)}
              sx={{
                bgcolor: pathname === link.href ? 'rgba(255,255,255,0.14)' : 'transparent',
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, mr: 0.5 }}>
          <Typography variant="body2">
            {user?.firstName} {user?.lastName}
          </Typography>
          <Chip
            size="small"
            label={user?.role === 'admin' ? 'Admin' : 'User'}
            sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff', fontWeight: 700 }}
          />
        </Box>
        <IconButton color="inherit" aria-label="Log out" onClick={handleLogout}>
          <LogoutOutlinedIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
