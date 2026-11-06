import api from './api';

const adminService = {
  users() {
    return api.get('/admin/users').then((response) => response.data);
  },
  setBlocked(userId, isBlocked) {
    return api.patch(`/admin/users/${userId}/block`, { isBlocked }).then((response) => response.data);
  },
  remove(userId) {
    return api.delete(`/admin/users/${userId}`).then((response) => response.data);
  },
};

export default adminService;
