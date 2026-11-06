import api from './api';

const chatService = {
  list() {
    return api.get('/chats').then((response) => response.data);
  },
  start(userId) {
    return api.post('/chats', { userId }).then((response) => response.data);
  },
  messages(conversationId) {
    return api.get(`/chats/${conversationId}/messages`).then((response) => response.data);
  },
  send(conversationId, text) {
    return api.post(`/chats/${conversationId}/messages`, { text }).then((response) => response.data);
  },
};

export default chatService;
