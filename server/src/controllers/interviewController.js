const prisma = require('../prismaClient');
const { generateQuestions, evaluateAnswer, overallFeedback } = require('./geminiController');

// POST /api/interviews/start
exports.startInterview = async (req, res, next) => {
  const { topic, difficulty = 'medium', count = 5 } = req.body;
  if (!topic) return res.status(400).json({ message: 'Topic is required' });

  let questions;
  try {
    questions = await generateQuestions(topic, difficulty, count);
  } catch (err) {
    return res.status(502).json({ message: 'AI service error: ' + err.message });
  }
  const interview = await prisma.interview.create({
    data: {
      userId: req.user.id,
      topic,
      difficulty,
      questions: {
        create: questions.map((q) => ({ question: q })),
      },
    },
    include: { questions: true },
  });
  res.status(201).json(interview);
};

// POST /api/interviews/:id/answer
exports.submitAnswer = async (req, res, next) => {
  const { questionId, answer } = req.body;
  const interview = await prisma.interview.findUnique({ where: { id: req.params.id } });
  if (!interview || interview.userId !== req.user.id)
    return res.status(403).json({ message: 'Forbidden' });

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) return res.status(404).json({ message: 'Question not found' });

  let evaluation;
  try {
    evaluation = await evaluateAnswer(question.question, answer, interview.topic);
  } catch (err) {
    return res.status(502).json({ message: 'AI service error: ' + err.message });
  }
  const updated = await prisma.question.update({
    where: { id: questionId },
    data: { userAnswer: answer, aiFeedback: evaluation.feedback, score: evaluation.score },
  });
  res.json(updated);
};

// POST /api/interviews/:id/complete
exports.completeInterview = async (req, res, next) => {
  const interview = await prisma.interview.findUnique({
    where: { id: req.params.id },
    include: { questions: true },
  });
  if (!interview || interview.userId !== req.user.id)
    return res.status(403).json({ message: 'Forbidden' });

  const answered = interview.questions.filter((q) => q.userAnswer);
  if (answered.length === 0)
    return res.status(400).json({ message: 'No answers submitted yet' });

  let result;
  try {
    result = await overallFeedback(interview.topic, answered);
  } catch (err) {
    return res.status(502).json({ message: 'AI service error: ' + err.message });
  }
  const updated = await prisma.interview.update({
    where: { id: req.params.id },
    data: { score: result.overallScore, feedback: result.overallFeedback, status: 'completed' },
    include: { questions: true },
  });
  res.json(updated);
};

// GET /api/interviews
exports.getHistory = async (req, res) => {
  const interviews = await prisma.interview.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { questions: true },
  });
  res.json(interviews);
};

// GET /api/interviews/:id
exports.getInterview = async (req, res) => {
  const interview = await prisma.interview.findUnique({
    where: { id: req.params.id },
    include: { questions: true },
  });
  if (!interview || interview.userId !== req.user.id)
    return res.status(403).json({ message: 'Forbidden' });
  res.json(interview);
};
