const express = require('express');
const { list, create, join, leave, messages, send } = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/', list);
router.post('/', create);
router.post('/:id/join', join);
router.post('/:id/leave', leave);
router.get('/:id/messages', messages);
router.post('/:id/messages', send);

module.exports = router;
