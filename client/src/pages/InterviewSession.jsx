import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Mic, MicOff, Send, ChevronRight, CheckCircle } from 'lucide-react';

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    api.get(`/interviews/${id}`).then(({ data }) => {
      setInterview(data);
      const firstUnanswered = data.questions.findIndex((q) => !q.userAnswer);
      setCurrentIdx(firstUnanswered === -1 ? data.questions.length - 1 : firstUnanswered);
    });
  }, [id]);

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return toast.error('Speech recognition not supported in this browser');
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join('');
      setAnswer(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return toast.error('Please provide an answer');
    setSubmitting(true);
    try {
      const q = interview.questions[currentIdx];
      const { data: updatedQ } = await api.post(`/interviews/${id}/answer`, {
        questionId: q.id,
        answer,
      });
      setInterview((prev) => ({
        ...prev,
        questions: prev.questions.map((q2) => (q2.id === updatedQ.id ? updatedQ : q2)),
      }));
      setAnswer('');
      toast.success(`Score: ${updatedQ.score}/10`);
      if (currentIdx < interview.questions.length - 1) {
        setCurrentIdx((i) => i + 1);
      }
    } catch {
      toast.error('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const completeInterview = async () => {
    setCompleting(true);
    try {
      const { data } = await api.post(`/interviews/${id}/complete`);
      navigate(`/interview/${id}/result`, { state: { interview: data } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete');
      setCompleting(false);
    }
  };

  if (!interview) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500"></div>
    </div>
  );

  const q = interview.questions[currentIdx];
  const answeredCount = interview.questions.filter((q) => q.userAnswer).length;
  const allAnswered = answeredCount === interview.questions.length;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">{interview.topic}</h1>
            <p className="text-slate-400 text-sm capitalize">{interview.difficulty} difficulty</p>
          </div>
          <span className="text-slate-400 text-sm">{answeredCount}/{interview.questions.length} answered</span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {interview.questions.map((q2, i) => (
            <button key={i} onClick={() => setCurrentIdx(i)}
              className={`h-2 flex-1 rounded-full transition ${
                q2.userAnswer ? 'bg-emerald-500' : i === currentIdx ? 'bg-violet-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Question Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
          <p className="text-xs text-violet-400 font-semibold mb-3">QUESTION {currentIdx + 1}</p>
          <p className="text-white text-lg leading-relaxed">{q.question}</p>
        </div>

        {/* Previous AI Feedback */}
        {q.userAnswer && (
          <div className="bg-slate-800 border border-emerald-700 rounded-2xl p-5 mb-6">
            <p className="text-emerald-400 font-semibold text-sm mb-2">✓ Answered — Score: {q.score}/10</p>
            <p className="text-slate-300 text-sm mb-2"><span className="text-slate-500">Your answer: </span>{q.userAnswer}</p>
            <p className="text-slate-300 text-sm"><span className="text-slate-500">AI Feedback: </span>{q.aiFeedback}</p>
          </div>
        )}

        {/* Answer Box */}
        {!q.userAnswer && (
          <div className="space-y-3">
            <div className="relative">
              <textarea
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-4 pr-12 min-h-[140px] focus:outline-none focus:border-violet-500 resize-none"
                placeholder="Type your answer or use voice input..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <button onClick={toggleVoice}
                className={`absolute top-3 right-3 p-2 rounded-lg transition ${
                  listening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-violet-400'
                }`}>
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={submitAnswer} disabled={submitting || !answer.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50">
                <Send size={16} />
                {submitting ? 'Evaluating...' : 'Submit Answer'}
              </button>
              {currentIdx < interview.questions.length - 1 && (
                <button onClick={() => { setAnswer(''); setCurrentIdx((i) => i + 1); }}
                  className="px-4 py-3 border border-slate-600 text-slate-400 rounded-xl hover:border-violet-500 transition">
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Complete Button */}
        {allAnswered && interview.status !== 'completed' && (
          <button onClick={completeInterview} disabled={completing}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50">
            <CheckCircle size={18} />
            {completing ? 'Getting overall feedback...' : 'Complete & Get AI Feedback'}
          </button>
        )}
      </div>
    </div>
  );
}
