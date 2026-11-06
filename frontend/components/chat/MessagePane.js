'use client';

import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/context/AuthContext';
import { formatDay, formatTime, fullName } from '@/utils/format';

export default function MessagePane({ messages, loading, showSender }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, loading]);

  if (loading && messages.length === 0) {
    return (
      <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  let previousDay = '';

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: { xs: 1.5, md: 3 }, py: 2 }}>
      {messages.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ mt: 6 }}>
          No messages yet. Say hello.
        </Typography>
      )}
      <Stack spacing={1}>
        {messages.map((message) => {
          const day = formatDay(message.createdAt);
          const showDay = day !== previousDay;
          previousDay = day;
          const mine = message.sender?.id === user?.id;

          return (
            <Box key={message.id}>
              {showDay && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  align="center"
                  sx={{ display: 'block', my: 1.5 }}
                >
                  {day}
                </Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                <Box
                  sx={{
                    maxWidth: 'min(78%, 520px)',
                    px: 1.5,
                    py: 1,
                    borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    bgcolor: mine ? 'primary.main' : 'background.paper',
                    color: mine ? 'primary.contrastText' : 'text.primary',
                    border: mine ? 'none' : '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {showSender && !mine && (
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: 'primary.main' }}>
                      {fullName(message.sender)}
                    </Typography>
                  )}
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                    {message.text}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.75 }}
                  >
                    {formatTime(message.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Stack>
      <Box ref={bottomRef} />
    </Box>
  );
}
