function idOf(value) {
  if (!value) return '';
  if (value._id) return String(value._id);
  return String(value);
}

function formatUser(user) {
  if (!user || !user.firstName) return null;
  return {
    id: idOf(user),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    country: user.country,
    role: user.role,
    isBlocked: Boolean(user.isBlocked),
    createdAt: user.createdAt,
  };
}

function formatConversation(conversation, currentUserId) {
  const other = (conversation.participants || []).find(
    (participant) => idOf(participant) !== String(currentUserId)
  );

  return {
    id: idOf(conversation),
    participant: formatUser(other),
    lastMessage: conversation.lastMessage || '',
    lastMessageAt: conversation.lastMessageAt || null,
  };
}

function formatGroup(group, currentUserId) {
  const members = (group.members || []).map((member) => formatUser(member)).filter(Boolean);

  return {
    id: idOf(group),
    name: group.name,
    description: group.description || '',
    members,
    memberCount: members.length,
    isMember: members.some((member) => member.id === String(currentUserId)),
    createdBy: formatUser(group.createdBy),
    lastMessage: group.lastMessage || '',
    lastMessageAt: group.lastMessageAt || null,
  };
}

function formatMessage(message) {
  return {
    id: idOf(message),
    text: message.text,
    createdAt: message.createdAt,
    conversationId: message.conversation ? idOf(message.conversation) : null,
    groupId: message.group ? idOf(message.group) : null,
    sender: formatUser(message.sender)
      ? {
          id: idOf(message.sender),
          firstName: message.sender.firstName,
          lastName: message.sender.lastName,
        }
      : null,
  };
}

module.exports = {
  idOf,
  formatUser,
  formatConversation,
  formatGroup,
  formatMessage,
};
