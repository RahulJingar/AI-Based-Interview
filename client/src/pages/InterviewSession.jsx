import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Mic, MicOff, Send, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const textareaRef = useRef(null);

  useEffect(() => {
    api.get(`/interviews/${id}`).then(({ data }) => {
      setInterview(data);
      const first = data.questions.findIndex((q) => !q.userAnswer);
      setCurrentIdx(first === -1 ? data.questions.length - 1 : first);
    });
  }, [id]);

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window))
      return toast.error('Browser mein voice support nahi hai');
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.continuous = true; r.interimResults = true;
    r.onresult = (e) => setAnswer(Array.from(e.results).map((x) => x[0].transcript).join(''));
    r.onend = () => setListening(false);
    r.start(); recognitionRef.current = r; setListening(true);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return toast.error('Pehle jawab do');
    setSubmitting(true);
    try {
      const q = interview.questions[currentIdx];
      const { data: updatedQ } = await api.post(`/interviews/${id}/answer`, { questionId: q.id, answer });
      setInterview((prev) => ({ ...prev, questions: prev.questions.map((q2) => q2.id === updatedQ.id ? updatedQ : q2) }));
      setAnswer('');
      toast.success(`Score: ${updatedQ.score}/10 🎯`);
      if (currentIdx < interview.questions.length - 1) setCurrentIdx((i) => i + 1);
    } catch { toast.error('Answer submit nahi hua'); }
    finally { setSubmitting(false); }
  };

  const completeInterview = async () => {
    setCompleting(true);
    try {
      const { data } = await api.post(`/interviews/${id}/complete`);
      navigate(`/interview/${id}/result`, { state: { interview: data } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Complete nahi hua');
      setCompleting(false);
    }
  };

  if (!interview) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Interview load ho raha hai...</p>
      </div>
    </div>
  );

  const q = interview.questions[currentIdx];
  const answeredCount = interview.questions.filter((q) => q.userAnswer).length;
  const allAnswered = answeredCount === interview.questions.length;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      {/* Top Progress Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-semibold text-sm">{interview.topic}</span>
              <span className="text-slate-500 text-xs ml-2 capitalize">• {interview.difficulty}</span>
            </div>
            <span className="text-slate-400 text-sm font-medium">{answeredCount}/{interview.questions.length}</span>
          </div>
          <div className="flex gap-1.5">
            {interview.questions.map((q2, i) => (
              <button key={i} onClick={() => setCurrentIdx(i)}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  q2.userAnswer ? 'bg-emerald-500' : i === currentIdx ? 'bg-violet-500' : 'bg-slate-700'
                }`} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {/* Question Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-violet-500/20 text-violet-400 text-xs font-bold px-3 py-1 rounded-full">
              Q{currentIdx + 1} of {interview.questions.length}
            </span>
            {q.score != null && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                q.score >= 7 ? 'bg-emerald-500/20 text-emerald-400' : q.score >= 5 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {q.score}/10 ✓
              </span>
            )}
          </div>
          <p className="text-white text-base sm:text-lg leading-relaxed">{q.question}</p>
        </div>

        {/* Answered Feedback */}
        {q.userAnswer && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
            <p className="text-emerald-400 text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle size={16} /> Tumhara jawab
            </p>
            <p className="text-slate-300 text-sm mb-4 bg-slate-800/50 rounded-xl p-3">{q.userAnswer}</p>
            <p className="text-violet-400 text-xs font-semibold mb-1">🤖 AI Feedback</p>
            <p className="text-slate-300 text-sm leading-relaxed">{q.aiFeedback}</p>
          </div>
        )}

        {/* Answer Input */}
        {!q.userAnswer && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-sm">Apna jawab do</p>
              <button onClick={toggleVoice}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  listening
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-400 hover:text-violet-400 border border-slate-700'
                }`}>
                {listening ? <><MicOff size={14} /> Stop</> : <><Mic size={14} /> Voice</>}
              </button>
            </div>
            <textarea
              ref={textareaRef}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 min-h-[120px] sm:min-h-[140px] focus:outline-none focus:border-violet-500 resize-none transition placeholder:text-slate-500 text-sm sm:text-base"
              placeholder="Yahan type karo ya voice use karo..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <div className="flex gap-3 mt-3">
              {currentIdx > 0 && (
                <button onClick={() => { setAnswer(''); setCurrentIdx((i) => i - 1); }}
                  className="p-3 border border-slate-700 text-slate-400 rounded-xl hover:border-slate-600 transition">
                  <ChevronLeft size={18} />
                </button>
              )}
              <button onClick={submitAnswer} disabled={submitting || !answer.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Evaluating...</>
                ) : (
                  <><Send size={16} /> Submit Answer</>
                )}
              </button>
              {currentIdx < interview.questions.length - 1 && (
                <button onClick={() => { setAnswer(''); setCurrentIdx((i) => i + 1); }}
                  className="p-3 border border-slate-700 text-slate-400 rounded-xl hover:border-slate-600 transition">
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigate when answered */}
        {q.userAnswer && currentIdx < interview.questions.length - 1 && (
          <button onClick={() => setCurrentIdx((i) => i + 1)}
            className="w-full flex items-center justify-center gap-2 border border-slate-700 hover:border-violet-500 text-slate-300 py-3 rounded-xl transition">
            Next Question <ChevronRight size={16} />
          </button>
        )}

        {/* Complete */}
        {allAnswered && interview.status !== 'completed' && (
          <button onClick={completeInterview} disabled={completing}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 rounded-2xl transition disabled:opacity-50 shadow-lg shadow-emerald-500/20">
            {completing ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> AI feedback aa raha hai...</>
            ) : (
              <><CheckCircle size={18} /> Complete & Get AI Feedback</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
