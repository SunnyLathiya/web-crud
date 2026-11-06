'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AuthLayout from '@/components/common/AuthLayout';
import AppButton from '@/components/common/AppButton';
import AppTextField from '@/components/common/AppTextField';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/utils/format';

export default function LoginForm() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('blocked') === '1') {
      setError('Your account has been blocked. Contact an admin.');
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === 'admin' ? '/admin' : '/chat');
    }
  }, [loading, router, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const nextUser = await login(email, password);
      router.push(nextUser.role === 'admin' ? '/admin' : '/chat');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not sign in'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || user) return <LoadingScreen />;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue a direct chat or rejoin a group."
      footer={
        <Typography color="text.secondary">
          New here?{' '}
          <Link component={NextLink} href="/signup" underline="hover">
            Create an account
          </Link>
        </Typography>
      }
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}
        <AppTextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <AppTextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((current) => !current)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <AppButton type="submit" loading={submitting} fullWidth size="large">
          Sign in
        </AppButton>
        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'rgba(12,107,99,0.05)' }}>
          <Typography variant="caption" color="text.secondary">
            Seeded admin: admin@webchat.com · Admin@123
          </Typography>
        </Paper>
      </Stack>
    </AuthLayout>
  );
}
