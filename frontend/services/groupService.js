import api from './api';

const groupService = {
  list() {
    return api.get('/groups').then((response) => response.data);
  },
  create(payload) {
    return api.post('/groups', payload).then((response) => response.data);
  },
  join(groupId) {
    return api.post(`/groups/${groupId}/join`).then((response) => response.data);
  },
  leave(groupId) {
    return api.post(`/groups/${groupId}/leave`).then((response) => response.data);
  },
  messages(groupId) {
    return api.get(`/groups/${groupId}/messages`).then((response) => response.data);
  },
  send(groupId, text) {
    return api.post(`/groups/${groupId}/messages`, { text }).then((response) => response.data);
  },
};

export default groupService;
