const express = require('express');
const { search } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/search', search);

module.exports = router;
