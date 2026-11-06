import api from './api';

const userService = {
  search(q) {
    return api.get('/users/search', { params: { q } }).then((response) => response.data);
  },
};

export default userService;
