const { chatWithAI } = require('./geminiController');

exports.askQuestion = async (req, res) => {
  try {
    const { question, history = [] } = req.body;
    if (!question || !question.trim())
      return res.status(400).json({ message: 'Question likh to sahi bhai!' });

    // history format: [{role: 'user'|'assistant', content: '...'}]
    const answer = await chatWithAI(question.trim(), history);
    res.json({ answer });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ answer: 'Sorry bhai, kuch technical problem hai. Thoda baad try karo!' });
  }
};
