'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import UserAvatar from '@/components/common/UserAvatar';
import { fullName } from '@/utils/format';

export default function ChatHeader({ active, isMobile, onBack, onLeave, online }) {
  const [anchor, setAnchor] = useState(null);
  const isGroup = active?.type === 'group';

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
        px: 1.5,
        py: 1.25,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        minHeight: 72,
      }}
    >
      {isMobile && (
        <IconButton aria-label="Back to conversations" onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
      )}
      {!isGroup && <UserAvatar user={active.participant} online={online} />}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>
          {active.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {isGroup
            ? active.subtitle
            : [online ? 'Online' : 'Offline', active.subtitle].filter(Boolean).join(' · ')}
        </Typography>
      </Box>
      {isGroup && (
        <>
          <IconButton aria-label="Show members" onClick={(event) => setAnchor(event.currentTarget)}>
            <GroupsOutlinedIcon />
          </IconButton>
          <IconButton aria-label="Leave group" onClick={onLeave}>
            <LogoutOutlinedIcon />
          </IconButton>
          <Popover
            open={Boolean(anchor)}
            anchorEl={anchor}
            onClose={() => setAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ p: 1, width: 260 }}>
              <Typography variant="subtitle2" sx={{ px: 1, py: 0.5 }}>
                Members
              </Typography>
              <List dense>
                {(active.members || []).map((member) => (
                  <ListItem key={member.id} disablePadding sx={{ px: 1 }}>
                    <ListItemAvatar>
                      <UserAvatar user={member} size={32} />
                    </ListItemAvatar>
                    <ListItemText primary={fullName(member)} secondary={member.country} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Popover>
        </>
      )}
    </Stack>
  );
}
