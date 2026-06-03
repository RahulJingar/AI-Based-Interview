const Groq = require('groq-sdk');

const key = process.env.GROQ_API_KEY || '';
const USE_MOCK = !key || key.length < 10;

let groq;
if (!USE_MOCK) {
  groq = new Groq({ apiKey: key });
}

const callGroq = async (prompt) => {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a helpful assistant. Always respond with valid JSON only. No extra text, no markdown, no explanation.' },
      { role: 'user', content: prompt }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });
  return completion.choices[0]?.message?.content?.trim() || '{}';
};

const callGroqText = async (prompt) => {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a helpful assistant. Always respond with valid JSON only. No extra text, no markdown, no explanation.' },
      { role: 'user', content: prompt }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
  });
  const text = completion.choices[0]?.message?.content?.trim() || '{}';
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : '{}';
};

// ── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_QUESTIONS = {
  react: [
    'React mein controlled aur uncontrolled components ka kya difference hai? Simple example do.',
    'useEffect hook kya karta hai? Kab use karte hain?',
    'Virtual DOM kya hota hai? Real DOM se kaise alag hai?',
    'React mein state kya hoti hai? Props se kaise different hai?',
    'Component kaise banate hain React mein? Function vs Class?',
    'React mein event handling kaise karte hain?',
    'Keys ka kya role hai React lists mein?',
    'React Router kya hai aur kaise use karte hain?',
  ],
  javascript: [
    'JavaScript mein variable kaise declare karte hain? var vs let ka difference?',
    'Function kya hota hai? Arrow function aur normal function mein kya fark?',
    'Array aur Object mein kya difference hai? Examples do.',
    'For loop aur forEach mein kya difference hai?',
    'JavaScript mein string manipulation kaise karte hain?',
    'if-else aur switch statement kab use karte hain?',
    'JavaScript mein error handling kaise karte hain?',
    'JSON kya hota hai? JavaScript object se kaise different?',
  ],
  typescript: [
    'TypeScript kya hai? JavaScript se kaise different hai?',
    'Type annotation kya hota hai TypeScript mein?',
    'Interface kya hota hai? Object structure define karne ke liye?',
    'TypeScript mein array aur object ki typing kaise karte hain?',
    'Function mein parameters ki type kaise define karte hain?',
    'Optional properties kya hoti hain interface mein?',
    'TypeScript compile kaise hota hai JavaScript mein?',
    'Basic types kya hain TypeScript mein? number, string, boolean?',
  ],
  nodejs: [
    'Node.js kya hai? Browser JavaScript se kaise different?',
    'npm kya hai? Package install kaise karte hain?',
    'Express.js kya hai? Basic server kaise banate hain?',
    'File system operations kaise karte hain Node mein?',
    'API endpoint kya hota hai? GET aur POST ka difference?',
    'Database connection kaise karte hain Node mein?',
    'Middleware kya hota hai Express mein?',
    'Environment variables kya hain? .env file kaise use karte hain?',
  ],
  default: [
    'HTML aur CSS kya hai? Webpage banane mein kaise use hote hain?',
    'Database kya hota hai? MySQL aur MongoDB ka basic difference?',
    'API kya hoti hai? Frontend aur backend kaise communicate karte hain?',
    'Git kya hai? Version control kyun important hai?',
    'Responsive design kya hota hai? Mobile friendly website kaise banaye?',
    'HTTP methods kya hain? GET, POST, PUT, DELETE ka use?',
    'Authentication kya hota hai? User login kaise implement karte hain?',
    'MVC pattern kya hai? Code organization ke liye?',
  ],
};

const getMockQuestions = (topic, count) => {
  const k = topic.toLowerCase().replace('node.js', 'nodejs').replace('.js', 'js');
  const pool = MOCK_QUESTIONS[k] || MOCK_QUESTIONS.default;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
};

// ── EXPORTS ──────────────────────────────────────────────────────────────────

exports.generateQuestions = async (topic, difficulty, count = 5, resumeContext = '') => {
  console.log('Generating questions - USE_MOCK:', USE_MOCK); // Debug
  
  if (USE_MOCK) {
    console.log('Using mock questions for topic:', topic); // Debug
    return getMockQuestions(topic, count);
  }

  let prompt;
  if (resumeContext && resumeContext.trim()) {
    console.log('Using resume context for questions'); // Debug
    // Resume-based questions
    prompt = `Generate ${count} interview questions for topic: "${topic}" at ${difficulty} level based on this candidate's resume.

Candidate's Resume:
${resumeContext.slice(0, 2000)}

Make questions specific to their experience and skills mentioned in resume.
Questions should be practical and in simple Hinglish - like a friend asking questions.
Test their real experience, not just theory.

Examples:
- "Tumne React mein jo project banaya hai, usme state management kaise kiya?"
- "Resume mein Node.js ka experience hai, API design kaise karte ho?"
- "Database mein jo work kiya hai, performance optimize kaise karte the?"

Return JSON object with questions array:
{"questions": ["question1", "question2", ...]}`;
  } else {
    console.log('Using generic questions for topic:', topic); // Debug
    // Generic questions
    prompt = `Generate ${count} interview questions for topic: "${topic}" at ${difficulty} level.

Make questions simple and practical - like a friend asking questions in Hinglish.
Questions should test basic understanding, not complex theory.
Use simple words that anyone can understand.

Example questions:
- "React mein component kya hota hai? Simple example do."
- "JavaScript mein function kaise banate hain?"
- "Database mein data kaise store karte hain?"

Return JSON object with questions array:
{"questions": ["question1", "question2", ...]}`;
  }

  try {
    console.log('Calling Groq AI...'); // Debug
    const data = JSON.parse(await callGroq(prompt));
    console.log('AI response:', data); // Debug
    return data.questions || [];
  } catch (error) {
    console.error('AI generation error:', error); // Debug
    // Fallback to mock questions
    return getMockQuestions(topic, count);
  }
};

exports.evaluateAnswer = async (question, answer, topic) => {
  if (USE_MOCK) {
    const score = Math.floor(Math.random() * 4) + 5;
    const feedbacks = [
      `Bilkul sahi bhai! Concept clear hai. Bas ek simple example add kar deta toh perfect hota.`,
      `Achha samjhaya hai! Main point pakad liya. Daily use mein kaise apply karte hain woh bhi bata deta.`,
      `Good! Basic concept samajh gaya hai. Thoda practical example deta toh aur clear hota.`,
      `Nice explanation! Samajh aa gaya. Real project mein kaise use karte hain woh mention kar sakta tha.`,
    ];
    return { score, feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)] };
  }

  const prompt = `Evaluate this answer about ${topic} like a friendly teacher.

Question: ${question}
Answer: ${answer}

Give feedback in simple Hinglish - like a bhai explaining to a friend. Use encouraging words.
Don't use technical jargon. Keep it simple and friendly.

Example feedback: "Achha samjhaya hai bhai! Concept clear hai. Bas ek simple example add kar deta toh perfect hota."

Return JSON:
{"score": <0-10>, "feedback": "<friendly simple feedback>"}`;

  return JSON.parse(await callGroq(prompt));
};

exports.overallFeedback = async (topic, questionsWithAnswers) => {
  if (USE_MOCK) {
    return {
      overallScore: Math.floor(Math.random() * 3) + 6,
      overallFeedback: `Overall bahut achha performance raha ${topic} mein! Basic concepts clear hain tere paas. Thoda practice kar aur real projects mein apply kar - bilkul ready hai tu interviews ke liye. Keep it up bhai!`,
    };
  }

  const qa = questionsWithAnswers.map((q, i) => `Q${i + 1}: ${q.question}\nAnswer: ${q.userAnswer}`).join('\n\n');

  const prompt = `Give overall feedback for this ${topic} interview. Be encouraging and friendly.

${qa}

Respond like a supportive friend in simple Hinglish. Focus on what they did well and simple tips to improve.
Use words like "achha", "bilkul sahi", "keep it up" etc.

Return JSON:
{"overallScore": <0-10>, "overallFeedback": "<encouraging overall feedback>"}`;

  return JSON.parse(await callGroq(prompt));
};

exports.analyzeResume = async (resumeText) => {
  if (USE_MOCK) {
    return {
      topics: ['JavaScript', 'React', 'Node.js', 'SQL', 'System Design'],
      summary: 'Achha profile hai bhai! Full-stack experience dikha raha hai. Frontend aur backend dono mein skills hain, interview preparation ke liye ready lag raha hai.',
    };
  }

  const prompt = `Analyze this resume and suggest 5 interview topics:
Resume: ${resumeText.slice(0, 2000)}

Give friendly summary in Hinglish - like a friend giving advice.
Focus on strengths and what topics to prepare for interviews.

Return JSON:
{"topics": ["topic1","topic2","topic3","topic4","topic5"], "summary": "<friendly 2 sentence Hinglish summary>"}`;

  return JSON.parse(await callGroqText(prompt));
};

exports.chatWithAI = async (question, conversationHistory = []) => {
  if (USE_MOCK) {
    return `Yeh bilkul simple hai bhai!\n\nJab tum koi kaam karte ho step by step, woh ek process hoti hai.\n\n\`\`\`mermaid\nflowchart TD\n    A[Start] --> B[Samjho Question]\n    B --> C[Answer Socho]\n    C --> D[Submit Karo]\n    D --> E[Done!]\`\`\`\n\nYaad raho: Practice se sab aata hai! 💪`;
  }

  try {
    const messages = [
      {
        role: 'system',
        content: `You are a friendly coding mentor. Rules:
1. NEVER repeat or restate the question back
2. Start your answer directly with the explanation
3. Explain in simple Hinglish (Hindi + English mix) like talking to a friend
4. Use simple words, avoid heavy jargon
5. Always include a Mermaid diagram when it helps visualize the concept
6. For processes/flows use: \`\`\`mermaid\nflowchart TD\n...\`\`\`
7. For sequences use: \`\`\`mermaid\nsequenceDiagram\n...\`\`\`
8. Keep diagrams simple with short labels
9. Remember full conversation context
10. Tone: "Dekho bhai...", "Simple hai!", "Samjha?"

Diagram example for event loop:
\`\`\`mermaid
flowchart TD
    A[Call Stack] --> B{Empty?}
    B -- No --> C[Execute Code]
    B -- Yes --> D[Check Event Queue]
    D --> A
\`\`\``
      },
      ...conversationHistory,
      { role: 'user', content: question }
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1500,
    });
    return completion.choices[0]?.message?.content?.trim() || 'Kuch samajh nahi aaya bhai, dobara pucho!';
  } catch (error) {
    console.error('Chat AI error:', error);
    return 'Sorry bhai, AI se baat nahi ho pa rahi. Thoda baad try karo!';
  }
};