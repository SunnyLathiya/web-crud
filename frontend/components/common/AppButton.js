'use client';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export default function AppButton({ children, loading = false, disabled, startIcon, ...props }) {
  return (
    <Button
      variant="contained"
      disableElevation
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      {...props}
    >
      {children}
    </Button>
  );
}
