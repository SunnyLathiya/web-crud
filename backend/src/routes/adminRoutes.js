const express = require('express');
const { listUsers, setBlocked, removeUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, adminOnly);
router.get('/users', listUsers);
router.patch('/users/:id/block', setBlocked);
router.delete('/users/:id', removeUser);

module.exports = router;
