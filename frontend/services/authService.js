import api from './api';

const authService = {
  signup(payload) {
    return api.post('/auth/signup', payload).then((response) => response.data);
  },
  login(payload) {
    return api.post('/auth/login', payload).then((response) => response.data);
  },
  me() {
    return api.get('/auth/me').then((response) => response.data);
  },
};

export default authService;
