const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const prisma = require('../prismaClient');
const { analyzeResume } = require('./geminiController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`),
});

exports.upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports.uploadResume = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const resumeUrl = `/uploads/${req.file.filename}`;
  await prisma.user.update({ where: { id: req.user.id }, data: { resumeUrl } });

  const buffer = fs.readFileSync(req.file.path);
  const pdfData = await pdfParse(buffer);
  let analysis;
  try {
    analysis = await analyzeResume(pdfData.text);
  } catch (err) {
    return res.status(502).json({ message: 'AI service error: ' + err.message });
  }
  res.json({ resumeUrl, ...analysis });
};
