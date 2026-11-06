'use client';

import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SendIcon from '@mui/icons-material/Send';
import AppTextField from '@/components/common/AppTextField';

export default function ComposeBar({ value, onChange, onSend, disabled, connected }) {
  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'flex-end',
        p: 1.5,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <AppTextField
        placeholder={connected ? 'Write a message' : 'Reconnecting…'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        multiline
        maxRows={4}
        inputProps={{ maxLength: 2000, 'aria-label': 'Message' }}
      />
      <IconButton
        color="primary"
        aria-label="Send message"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        sx={{
          flexShrink: 0,
          bgcolor: 'primary.main',
          color: '#fff',
          borderRadius: 2,
          '&:hover': { bgcolor: 'primary.dark' },
          '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'text.disabled' },
        }}
      >
        <SendIcon />
      </IconButton>
    </Stack>
  );
}
