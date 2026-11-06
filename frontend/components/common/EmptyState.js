'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function EmptyState({ icon, title, description }) {
  return (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: 3 }}>
      <Box sx={{ maxWidth: 380 }}>
        {icon && <Box sx={{ color: 'primary.main', mb: 1.5 }}>{icon}</Box>}
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Box>
    </Box>
  );
}
