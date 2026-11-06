'use client';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function StatCard({ label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.25, flex: 1, minWidth: 140 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
}
