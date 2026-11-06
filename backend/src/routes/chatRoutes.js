const express = require('express');
const { list, start, messages, send } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/', list);
router.post('/', start);
router.get('/:id/messages', messages);
router.post('/:id/messages', send);

module.exports = router;
