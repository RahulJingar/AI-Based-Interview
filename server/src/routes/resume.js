const router = require('express').Router();
const auth = require('../middleware/auth');
const { upload, uploadResume } = require('../controllers/resumeController');

router.post('/upload', auth, upload.single('resume'), uploadResume);

module.exports = router;
