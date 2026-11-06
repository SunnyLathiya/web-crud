'use client';

import Box from '@mui/material/Box';

export default function Logo({ size = 36 }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        borderRadius: '32%',
        bgcolor: 'secondary.main',
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'var(--font-display), Georgia, serif',
        fontWeight: 700,
        fontSize: size * 0.42,
        flexShrink: 0,
      }}
    >
      W
    </Box>
  );
}
