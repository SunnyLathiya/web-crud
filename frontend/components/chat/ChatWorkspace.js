'use client';

import { useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AppNavbar from '@/components/common/AppNavbar';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import chatService from '@/services/chatService';
import groupService from '@/services/groupService';
import { applyMembership, fullName, getErrorMessage } from '@/utils/format';
import { emitWithAck } from '@/utils/socket';
import ChatHeader from './ChatHeader';
import ComposeBar from './ComposeBar';
import CreateGroupDialog from './CreateGroupDialog';
import DirectPanel from './DirectPanel';
import GroupPanel from './GroupPanel';
import MessagePane from './MessagePane';

function sortByRecent(items) {
  return [...items].sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
}

function appendUnique(current, message) {
  if (!message || current.some((item) => item.id === message.id)) return current;
  return [...current, message];
}

export default function ChatWorkspace() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const { socket, connected, isOnline } = useSocket();
  const [tab, setTab] = useState('direct');
  const [conversations, setConversations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [banner, setBanner] = useState('');
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const activeRef = useRef(null);
  const userIdRef = useRef(user?.id);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [conversationData, groupData] = await Promise.all([
          chatService.list(),
          groupService.list(),
        ]);
        if (cancelled) return;
        setConversations(sortByRecent(conversationData));
        setGroups(sortByRecent(groupData.map((group) => applyMembership(group, user.id))));
      } catch (error) {
        if (!cancelled) setBanner(getErrorMessage(error, 'Could not load chats'));
      } finally {
        if (!cancelled) setLoadingLists(false);
      }
    }

    if (user?.id) load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const activeKey = active ? `${active.type}:${active.id}` : '';

  useEffect(() => {
    if (!activeKey || !user?.id) return undefined;
    const separator = activeKey.indexOf(':');
    const type = activeKey.slice(0, separator);
    const id = activeKey.slice(separator + 1);
    let cancelled = false;

    setMessages([]);
    setDraft('');
    setLoadingMessages(true);
    setBanner('');

    const request = type === 'direct' ? chatService.messages(id) : groupService.messages(id);
    request
      .then((data) => {
        if (cancelled) return;
        setMessages((current) => {
          const merged = [...data];
          current.forEach((item) => {
            if (!merged.some((message) => message.id === item.id)) merged.push(item);
          });
          merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          return merged;
        });
      })
      .catch((error) => {
        if (!cancelled) setBanner(getErrorMessage(error, 'Could not load messages'));
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeKey, user?.id]);

  useEffect(() => {
    if (!socket) return undefined;

    const joinActiveRoom = () => {
      const current = activeRef.current;
      if (!current) return;
      socket.emit('room:join', { type: current.type, id: current.id });
    };

    const onMessage = (message) => {
      const current = activeRef.current;
      if (!current) return;
      const matches = current.type === 'direct'
        ? message.conversationId && String(message.conversationId) === String(current.id)
        : message.groupId && String(message.groupId) === String(current.id);
      if (!matches) return;
      setMessages((currentMessages) => appendUnique(currentMessages, message));
    };

    const onConversation = (conversation) => {
      setConversations((current) => sortByRecent([
        conversation,
        ...current.filter((item) => item.id !== conversation.id),
      ]));
    };

    const onGroup = (group) => {
      const next = applyMembership(group, userIdRef.current);
      setGroups((current) => sortByRecent([
        next,
        ...current.filter((item) => item.id !== next.id),
      ]));

      const current = activeRef.current;
      if (current?.type !== 'group' || current.id !== next.id) return;
      if (!next.isMember) {
        setActive(null);
        setMessages([]);
        return;
      }
      setActive((previous) => (previous ? {
        ...previous,
        title: next.name,
        subtitle: `${next.memberCount} member${next.memberCount === 1 ? '' : 's'}`,
        members: next.members,
      } : previous));
    };

    socket.on('connect', joinActiveRoom);
    socket.on('message:new', onMessage);
    socket.on('conversation:updated', onConversation);
    socket.on('group:updated', onGroup);
    joinActiveRoom();

    return () => {
      socket.off('connect', joinActiveRoom);
      socket.off('message:new', onMessage);
      socket.off('conversation:updated', onConversation);
      socket.off('group:updated', onGroup);
    };
  }, [socket, activeKey]);

  function openConversation(conversation) {
    setTab('direct');
    setActive({
      type: 'direct',
      id: conversation.id,
      title: fullName(conversation.participant),
      subtitle: conversation.participant?.country || '',
      participant: conversation.participant,
    });
  }

  function openGroup(group) {
    const next = applyMembership(group, user.id);
    setTab('groups');
    setActive({
      type: 'group',
      id: next.id,
      title: next.name,
      subtitle: `${next.memberCount} member${next.memberCount === 1 ? '' : 's'}`,
      members: next.members,
    });
  }

  async function handleStart(person) {
    try {
      const conversation = await chatService.start(person.id);
      setConversations((current) => sortByRecent([
        conversation,
        ...current.filter((item) => item.id !== conversation.id),
      ]));
      openConversation(conversation);
    } catch (error) {
      setBanner(getErrorMessage(error, 'Could not start the chat'));
    }
  }

  async function handleOpenGroup(group) {
    try {
      const next = group.isMember ? group : await groupService.join(group.id);
      const withMembership = applyMembership(next, user.id);
      setGroups((current) => sortByRecent([
        withMembership,
        ...current.filter((item) => item.id !== withMembership.id),
      ]));
      openGroup(withMembership);
    } catch (error) {
      setBanner(getErrorMessage(error, 'Could not open the group'));
    }
  }

  async function handleCreateGroup(payload) {
    const group = await groupService.create(payload);
    const next = applyMembership(group, user.id);
    setGroups((current) => sortByRecent([
      next,
      ...current.filter((item) => item.id !== next.id),
    ]));
    openGroup(next);
    setGroupDialogOpen(false);
  }

  async function handleLeave() {
    if (active?.type !== 'group') return;
    setLeaving(true);
    try {
      await groupService.leave(active.id);
      setActive(null);
      setMessages([]);
      setConfirmLeave(false);
      const latest = await groupService.list();
      setGroups(sortByRecent(latest.map((group) => applyMembership(group, user.id))));
    } catch (error) {
      setBanner(getErrorMessage(error, 'Could not leave the group'));
    } finally {
      setLeaving(false);
    }
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || !active || sending) return;
    setSending(true);
    setBanner('');

    try {
      let message;
      if (socket?.connected) {
        const response = await emitWithAck(
          socket,
          'message:send',
          active.type === 'direct'
            ? { conversationId: active.id, text }
            : { groupId: active.id, text }
        );
        if (response?.error) throw new Error(response.error);
        message = response?.message;
      } else if (active.type === 'direct') {
        message = await chatService.send(active.id, text);
      } else {
        message = await groupService.send(active.id, text);
      }

      if (message) setMessages((current) => appendUnique(current, message));
      setDraft('');
    } catch (error) {
      setBanner(getErrorMessage(error, 'Could not send the message'));
    } finally {
      setSending(false);
    }
  }

  const showList = !isMobile || !active;
  const showPane = !isMobile || Boolean(active);

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'background.default' }}>
      <AppNavbar />
      {banner && (
        <Alert severity="error" onClose={() => setBanner('')}>
          {banner}
        </Alert>
      )}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <Box
          sx={{
            width: { xs: '100%', md: 340 },
            flexShrink: 0,
            display: showList ? 'flex' : 'none',
            flexDirection: 'column',
            minHeight: 0,
            borderRight: { md: 1 },
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Tabs value={tab} onChange={(event, value) => setTab(value)} variant="fullWidth">
            <Tab value="direct" icon={<ForumOutlinedIcon />} iconPosition="start" label="Direct" />
            <Tab value="groups" icon={<GroupsOutlinedIcon />} iconPosition="start" label="Groups" />
          </Tabs>
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {tab === 'direct' ? (
              <DirectPanel
                conversations={conversations}
                activeId={active?.type === 'direct' ? active.id : ''}
                onSelect={openConversation}
                onStart={handleStart}
                isOnline={isOnline}
                loading={loadingLists}
              />
            ) : (
              <GroupPanel
                groups={groups}
                activeId={active?.type === 'group' ? active.id : ''}
                onOpen={handleOpenGroup}
                onCreate={() => setGroupDialogOpen(true)}
                loading={loadingLists}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, display: showPane ? 'flex' : 'none', flexDirection: 'column', minHeight: 0 }}>
          {active ? (
            <>
              <ChatHeader
                active={active}
                isMobile={isMobile}
                onBack={() => setActive(null)}
                onLeave={() => setConfirmLeave(true)}
                online={active.type === 'direct' && isOnline(active.participant?.id)}
              />
              <MessagePane messages={messages} loading={loadingMessages} showSender={active.type === 'group'} />
              <ComposeBar
                value={draft}
                onChange={setDraft}
                onSend={handleSend}
                disabled={sending || loadingMessages}
                connected={connected}
              />
            </>
          ) : (
            <EmptyState
              icon={tab === 'direct' ? <ForumOutlinedIcon sx={{ fontSize: 42 }} /> : <GroupsOutlinedIcon sx={{ fontSize: 42 }} />}
              title={tab === 'direct' ? 'Choose a conversation' : 'Choose a group'}
              description={
                tab === 'direct'
                  ? 'Search for another registered user and the messages will arrive as they are sent.'
                  : 'Create a group or join one. If you leave and come back, the earlier messages are still there.'
              }
            />
          )}
        </Box>
      </Box>

      {groupDialogOpen && (
        <CreateGroupDialog
          open
          onClose={() => setGroupDialogOpen(false)}
          onCreate={handleCreateGroup}
        />
      )}
      <ConfirmDialog
        open={confirmLeave}
        title="Leave this group?"
        description="You can join again later and the message history will still be here."
        confirmLabel="Leave group"
        loading={leaving}
        onClose={() => setConfirmLeave(false)}
        onConfirm={handleLeave}
      />
    </Box>
  );
}
