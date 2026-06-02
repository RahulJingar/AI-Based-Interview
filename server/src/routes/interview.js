const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getHistory,
  getInterview,
} = require('../controllers/interviewController');

router.use(auth);
router.post('/start', startInterview);
router.get('/', getHistory);
router.get('/:id', getInterview);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeInterview);

module.exports = router;
