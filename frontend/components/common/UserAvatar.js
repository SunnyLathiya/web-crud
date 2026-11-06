'use client';

import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import { initials } from '@/utils/format';

const COLORS = ['#0c6b63', '#1f6f8b', '#b85b24', '#3f6b4e', '#6b4c7a'];

function colorFor(label) {
  const total = [...label].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return COLORS[total % COLORS.length];
}

export default function UserAvatar({ user, online = false, size = 40 }) {
  const label = initials(user);

  return (
    <Badge
      overlap="circular"
      variant="dot"
      invisible={!online}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        '& .MuiBadge-badge': {
          bgcolor: '#2e7d4f',
          color: '#2e7d4f',
          boxShadow: '0 0 0 2px #fff',
          width: 10,
          height: 10,
          borderRadius: '50%',
        },
      }}
    >
      <Avatar
        sx={{
          width: size,
          height: size,
          bgcolor: colorFor(label),
          fontSize: size * 0.36,
          fontWeight: 700,
        }}
      >
        {label}
      </Avatar>
    </Badge>
  );
}
