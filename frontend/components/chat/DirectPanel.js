'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import AppTextField from '@/components/common/AppTextField';
import UserAvatar from '@/components/common/UserAvatar';
import userService from '@/services/userService';
import { formatTime, fullName, getErrorMessage } from '@/utils/format';

export default function DirectPanel({ conversations, activeId, onSelect, onStart, isOnline, loading }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults([]);
      setSearching(false);
      setError('');
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const users = await userService.search(term);
        if (!cancelled) {
          setResults(users);
          setError('');
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Search failed'));
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <Box>
      <Box sx={{ p: 1.5 }}>
        <AppTextField
          placeholder="Search people by name or email"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searching ? <CircularProgress size={16} /> : null,
          }}
        />
        {error && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.75 }}>
            {error}
          </Typography>
        )}
      </Box>

      {results.length > 0 && (
        <List dense disablePadding sx={{ pb: 1 }}>
          {results.map((person) => (
            <ListItemButton
              key={person.id}
              onClick={() => {
                onStart(person);
                setQuery('');
                setResults([]);
              }}
            >
              <ListItemAvatar>
                <UserAvatar user={person} online={isOnline(person.id)} />
              </ListItemAvatar>
              <ListItemText
                primary={fullName(person)}
                secondary={person.email}
                slotProps={{ secondary: { noWrap: true } }}
              />
            </ListItemButton>
          ))}
        </List>
      )}

      <List disablePadding>
        {conversations.map((conversation) => (
          <ListItemButton
            key={conversation.id}
            selected={conversation.id === activeId}
            onClick={() => onSelect(conversation)}
            sx={{
              '&.Mui-selected': { bgcolor: 'rgba(12,107,99,0.1)' },
              '&.Mui-selected:hover': { bgcolor: 'rgba(12,107,99,0.16)' },
            }}
          >
            <ListItemAvatar>
              <UserAvatar user={conversation.participant} online={isOnline(conversation.participant?.id)} />
            </ListItemAvatar>
            <ListItemText
              primary={fullName(conversation.participant)}
              secondary={
                conversation.lastMessage
                  ? `${conversation.lastMessage}${conversation.lastMessageAt ? ` · ${formatTime(conversation.lastMessageAt)}` : ''}`
                  : 'No messages yet'
              }
              slotProps={{ primary: { noWrap: true }, secondary: { noWrap: true } }}
            />
          </ListItemButton>
        ))}
      </List>

      {!loading && conversations.length === 0 && results.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 3 }}>
          Search for a registered person to start a one-to-one chat.
        </Typography>
      )}
    </Box>
  );
}
