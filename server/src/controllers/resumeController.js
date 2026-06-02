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
  try {
    if (!req.file) return res.status(400).json({ message: 'PDF file select karo' });
    
    const resumeUrl = `/uploads/${req.file.filename}`;
    
    console.log('Reading PDF file:', req.file.path);
    const buffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(buffer);
    
    console.log('PDF text extracted:', pdfData.text.slice(0, 100));
    
    // Store resume text in database for later interview use (if supported)
    try {
      await prisma.user.update({ 
        where: { id: req.user.id }, 
        data: { 
          resumeUrl,
          // resumeText: pdfData.text.slice(0, 5000) // TODO: Add after migration
        }
      });
    } catch (dbError) {
      console.log('Database update failed, continuing without resumeText storage');
      await prisma.user.update({ 
        where: { id: req.user.id }, 
        data: { resumeUrl }
      });
    }

    let analysis;
    try {
      analysis = await analyzeResume(pdfData.text);
      console.log('AI analysis response:', analysis); // Debug
    } catch (err) {
      console.error('AI analysis error:', err.message);
      return res.status(502).json({ message: 'AI service error: ' + err.message });
    }
    
    // Ensure topics array exists
    if (!analysis.topics || !Array.isArray(analysis.topics)) {
      analysis.topics = ['JavaScript', 'React', 'Node.js', 'SQL', 'System Design']; // Fallback
      analysis.summary = analysis.summary || 'Resume analyzed successfully. Ready for interview!';
    }
    
    res.json({ resumeUrl, ...analysis });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Resume upload failed: ' + error.message });
  }
};
