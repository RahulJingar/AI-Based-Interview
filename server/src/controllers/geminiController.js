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
    'React mein controlled aur uncontrolled components ka kya difference hai? Ek example do.',
    'useEffect aur useLayoutEffect mein kya farak hai? Kab kaunsa use karein?',
    'Virtual DOM kya hota hai aur React isko kaise use karta hai performance ke liye?',
    'useCallback aur useMemo kab use karna chahiye? Dono ka difference explain karo.',
    'React Context API kya hai aur Redux se kab better hai?',
    'React mein component re-render kab hota hai aur isko kaise optimize karein?',
    'Higher Order Components (HOC) kya hote hain? Real world example do.',
    'useRef aur useState mein kya difference hai?',
  ],
  javascript: [
    'JavaScript mein closure kya hota hai? Ek practical example ke saath explain karo.',
    'Event loop kaise kaam karta hai? Macro aur micro tasks ka difference batao.',
    'Prototypal inheritance kya hai? Class-based inheritance se kaise alag hai?',
    'Promise aur async/await mein kya difference hai?',
    'var, let, aur const mein kya farak hai? Hoisting explain karo.',
    'this keyword JavaScript mein alag alag contexts mein kaise behave karta hai?',
    'Debouncing aur throttling kya hai? Kab use karte hain?',
    'call, apply, aur bind mein kya difference hai?',
  ],
  typescript: [
    'TypeScript mein interface aur type alias ka kya difference hai?',
    'Generics kya hote hain TypeScript mein? Ek real example do.',
    'any, unknown, aur never types mein kya difference hai?',
    'Union types aur intersection types kaise kaam karte hain?',
    'keyof aur typeof operators ka kya use hai?',
    'Utility types jaise Partial, Required, Pick, Omit explain karo.',
    'TypeScript strict mode kya enable karta hai aur kyun important hai?',
    'Mapped types aur conditional types explain karo.',
  ],
  nodejs: [
    'Node.js ka event loop kaise kaam karta hai? Phases explain karo.',
    'process.nextTick aur setImmediate mein kya difference hai?',
    'Node.js mein streams kya hote hain aur kab use karein?',
    'Express.js mein middleware pattern kaise kaam karta hai?',
    'Node.js mein memory leak kaise detect aur fix karte hain?',
    'CommonJS aur ES Modules mein kya difference hai?',
    'Node.js mein error handling best practices kya hain?',
    'Clustering kya hai Node.js mein aur kyun use karte hain?',
  ],
  default: [
    'REST API aur GraphQL mein kya farak hai? Kab kaunsa choose karein?',
    'SQL aur NoSQL databases ka difference explain karo.',
    'Authentication aur authorization mein kya farak hai? JWT kaise kaam karta hai?',
    'Microservices aur monolithic architecture mein kya difference hai?',
    'SOLID principles kya hain? Explain with examples.',
    'Database indexing kya hai aur performance pe kaise affect karta hai?',
    'Caching kya hai? Redis kab use karna chahiye?',
    'Docker aur virtual machines mein kya farak hai?',
  ],
};

const getMockQuestions = (topic, count) => {
  const k = topic.toLowerCase().replace('node.js', 'nodejs').replace('.js', 'js');
  const pool = MOCK_QUESTIONS[k] || MOCK_QUESTIONS.default;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
};

// ── EXPORTS ──────────────────────────────────────────────────────────────────

exports.generateQuestions = async (topic, difficulty, count = 5) => {
  if (USE_MOCK) return getMockQuestions(topic, count);

  const prompt = `You are an experienced technical interviewer at a top tech company.
Generate ${count} interview questions for topic: "${topic}" at ${difficulty} difficulty level.

Rules:
- Questions should be in Hinglish (mix of Hindi and English in Roman script) — exactly how Indian developers talk
- Questions must be practical and test real understanding, not just definitions
- Make each question unique and thought-provoking
- Return ONLY a valid JSON object with a "questions" array
- Example: {"questions": ["React mein hooks kyun use karte hain?", "Explain event loop"]}`;

  const data = JSON.parse(await callGroq(prompt));
  return data.questions;
};

exports.evaluateAnswer = async (question, answer, topic) => {
  if (USE_MOCK) {
    const score = Math.floor(Math.random() * 4) + 5;
    const feedbacks = [
      `Acha answer hai! Tune main points cover kiye hain. Aur improve karne ke liye real-world examples add karo aur edge cases mention karo.`,
      `Solid understanding dikha raha hai. Explanation clear hai lekin performance implications aur best practices bhi mention kar sakta tha.`,
      `Concept sahi pakda hai. Production mein iska application aur common pitfalls bhi bata sakta tha.`,
      `Fundamentals cover kiye hain. Code examples ya alternative approaches ka comparison add karta toh answer aur strong hota.`,
    ];
    return { score, feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)] };
  }

  const prompt = `You are a strict but friendly senior developer interviewing for "${topic}".

Question: ${question}
Candidate's Answer: ${answer}

Evaluate this answer. Respond in Hinglish (mix of Hindi and English in Roman script) like how Indian developers talk to each other.
Be specific — mention what was good and what was missing.

Return ONLY valid JSON, no markdown:
{"score": <number 0-10>, "feedback": "<2-3 sentences of specific Hinglish feedback>"}`;

  return JSON.parse(await callGroq(prompt));
};

exports.overallFeedback = async (topic, questionsWithAnswers) => {
  if (USE_MOCK) {
    return {
      overallScore: Math.floor(Math.random() * 3) + 6,
      overallFeedback: `Overall ${topic} mein teri understanding achhi hai. Tune basic aur intermediate concepts well cover kiye. Edge cases aur real-world scenarios pe focus kar aur system design thinking sharpen kar. Keep practicing bhai, you're on the right track!`,
    };
  }

  const qa = questionsWithAnswers.map((q, i) => `Q${i + 1}: ${q.question}\nAnswer: ${q.userAnswer}`).join('\n\n');

  const prompt = `You are a senior technical interviewer. Based on this complete mock interview for "${topic}", give overall assessment.

${qa}

Respond in Hinglish (mix of Hindi and English in Roman script) — honest and friendly like a senior dev giving feedback.

Return ONLY valid JSON, no markdown:
{"overallScore": <number 0-10>, "overallFeedback": "<3-4 sentences of honest Hinglish overall feedback>"}`;

  return JSON.parse(await callGroq(prompt));
};

exports.analyzeResume = async (resumeText) => {
  if (USE_MOCK) {
    return {
      topics: ['JavaScript', 'React', 'Node.js', 'SQL', 'System Design'],
      summary: 'Strong full-stack developer profile with experience in modern web technologies. Frontend aur backend dono mein achha experience dikha raha hai resume mein.',
    };
  }

  const prompt = `Analyze this resume and suggest top 5 interview topics the candidate should prepare for.
Resume: ${resumeText.slice(0, 2000)}

Give summary in Hinglish — friendly and helpful tone.
Return ONLY valid JSON object, no markdown:
{"topics": ["topic1","topic2","topic3","topic4","topic5"], "summary": "<2 sentence Hinglish summary>"}`;

  return JSON.parse(await callGroqText(prompt));
};
