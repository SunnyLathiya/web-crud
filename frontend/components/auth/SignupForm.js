'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AuthLayout from '@/components/common/AuthLayout';
import AppButton from '@/components/common/AppButton';
import AppCountryField from '@/components/common/AppCountryField';
import AppTextField from '@/components/common/AppTextField';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/utils/format';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  country: '',
  password: '',
};

export default function SignupForm() {
  const { user, loading, signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/chat');
  }, [loading, router, user]);

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await signup(form);
      router.push('/chat');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create the account'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || user) return <LoadingScreen />;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Use your name, email, country, and a password of at least 6 characters."
      footer={
        <Typography color="text.secondary">
          Already registered?{' '}
          <Link component={NextLink} href="/login" underline="hover">
            Sign in
          </Link>
        </Typography>
      }
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
          <AppTextField
            label="First name"
            name="firstName"
            autoComplete="given-name"
            value={form.firstName}
            onChange={update('firstName')}
            required
          />
          <AppTextField
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            value={form.lastName}
            onChange={update('lastName')}
            required
          />
        </Box>
        <AppTextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={form.email}
          onChange={update('email')}
          required
        />
        <AppCountryField value={form.country} onChange={(country) => setForm((current) => ({ ...current, country }))} />
        <AppTextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update('password')}
          required
          helperText="At least 6 characters"
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
          Sign up
        </AppButton>
      </Stack>
    </AuthLayout>
  );
}
