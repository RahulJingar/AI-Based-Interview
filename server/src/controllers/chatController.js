const { chatWithAI } = require('./geminiController');

exports.askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question likh to sahi bhai!' });
    }

    console.log('User question:', question);
    const answer = await chatWithAI(question.trim());
    console.log('AI response:', answer);

    res.json({ answer });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      message: 'AI chat error: ' + error.message,
      answer: "Sorry bhai, kuch technical problem hai. Simple words mein pucho ya baad mein try karo! 😅"
    });
  }
};