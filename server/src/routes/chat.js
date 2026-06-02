const router = require('express').Router();
const auth = require('../middleware/auth');
const { askQuestion } = require('../controllers/chatController');

router.use(auth);
router.post('/ask', askQuestion);

module.exports = router;