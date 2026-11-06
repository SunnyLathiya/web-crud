'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { formatTime } from '@/utils/format';

function GroupList({ groups, activeId, onOpen, actionLabel }) {
  if (groups.length === 0) return null;

  return (
    <List disablePadding>
      {groups.map((group) => (
        <ListItemButton
          key={group.id}
          selected={group.id === activeId}
          onClick={() => onOpen(group)}
          sx={{
            '&.Mui-selected': { bgcolor: 'rgba(12,107,99,0.1)' },
            '&.Mui-selected:hover': { bgcolor: 'rgba(12,107,99,0.16)' },
          }}
        >
          <ListItemText
            primary={group.name}
            secondary={
              group.lastMessage
                ? `${group.lastMessage}${group.lastMessageAt ? ` · ${formatTime(group.lastMessageAt)}` : ''}`
                : `${group.memberCount} member${group.memberCount === 1 ? '' : 's'}`
            }
            slotProps={{ primary: { noWrap: true }, secondary: { noWrap: true } }}
          />
          {actionLabel && <Chip size="small" label={actionLabel} variant="outlined" />}
        </ListItemButton>
      ))}
    </List>
  );
}

export default function GroupPanel({ groups, activeId, onOpen, onCreate, loading }) {
  const mine = groups.filter((group) => group.isMember);
  const discover = groups.filter((group) => !group.isMember);

  return (
    <Box sx={{ p: 1.5 }}>
      <Button variant="outlined" startIcon={<AddIcon />} fullWidth onClick={onCreate}>
        Create group
      </Button>

      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mt: 2, px: 0.5 }}>
        Your groups
      </Typography>
      <GroupList groups={mine} activeId={activeId} onOpen={onOpen} />
      {!loading && mine.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ px: 0.5, py: 1 }}>
          You have not joined a group yet.
        </Typography>
      )}

      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mt: 2, px: 0.5 }}>
        Discover
      </Typography>
      <GroupList groups={discover} activeId={activeId} onOpen={onOpen} actionLabel="Join" />
      {!loading && discover.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ px: 0.5, py: 1 }}>
          No other groups to join right now.
        </Typography>
      )}
    </Box>
  );
}
