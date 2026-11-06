export function fullName(user) {
  if (!user) return 'Unknown user';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown user';
}

export function initials(user) {
  const first = user?.firstName?.[0] || '';
  const last = user?.lastName?.[0] || '';
  return `${first}${last}`.toUpperCase() || '?';
}

export function formatTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDay(value) {
  if (!value) return '';
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

export function applyMembership(group, userId) {
  const members = group?.members || [];
  return {
    ...group,
    memberCount: members.length,
    isMember: members.some((member) => member.id === String(userId)),
  };
}
