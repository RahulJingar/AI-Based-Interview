import { useLocation, useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Trophy, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';

function ScoreBadge({ score }) {
  if (score == null) return <span className="text-slate-500">—</span>;
  const color = score >= 7 ? 'text-emerald-400' : score >= 5 ? 'text-amber-400' : 'text-red-400';
  return <span className={`font-bold ${color}`}>{score}/10</span>;
}

export default function InterviewResult() {
  const { state } = useLocation();
  const { id } = useParams();
  const [interview, setInterview] = useState(state?.interview || null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!interview) api.get(`/interviews/${id}`).then(({ data }) => setInterview(data));
  }, [id]);

  if (!interview) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const score = interview.score || 0;
  const scoreColor = score >= 7 ? 'text-emerald-400' : score >= 5 ? 'text-amber-400' : 'text-red-400';
  const scoreMsg = score >= 8 ? '🔥 Excellent!' : score >= 6 ? '👍 Good Job!' : score >= 4 ? '💪 Keep Going!' : '📚 Keep Practicing!';
  const circumference = 2 * Math.PI * 45;
  const strokeDash = (score / 10) * circumference;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Score Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-6 text-center">
          <p className="text-slate-400 text-sm mb-4">{interview.topic} • <span className="capitalize">{interview.difficulty}</span></p>
          
          {/* Circular Progress */}
          <div className="relative w-36 h-36 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none"
                stroke={score >= 7 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${strokeDash} ${circumference}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Trophy size={20} className="text-amber-400 mb-1" />
              <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
              <span className="text-slate-500 text-xs">/10</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">{scoreMsg}</h1>
          
          {interview.feedback && (
            <p className="text-slate-400 text-sm leading-relaxed mt-3 max-w-lg mx-auto">{interview.feedback}</p>
          )}
        </div>

        {/* Questions breakdown */}
        <div className="space-y-2.5 mb-6">
          {interview.questions.map((q, i) => (
            <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-800/50 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-slate-500 font-medium flex-shrink-0">Q{i + 1}</span>
                  <p className="text-white text-sm font-medium truncate">{q.question}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <ScoreBadge score={q.score} />
                  {expanded === i ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </div>
              </button>

              {expanded === i && (
                <div className="px-4 sm:px-5 pb-4 border-t border-slate-800 pt-4 space-y-3">
                  {q.userAnswer ? (
                    <>
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">YOUR ANSWER</p>
                        <p className="text-slate-300 text-sm bg-slate-800/50 rounded-xl p-3">{q.userAnswer}</p>
                      </div>
                      <div>
                        <p className="text-xs text-violet-400 font-medium mb-1">🤖 AI FEEDBACK</p>
                        <p className="text-slate-300 text-sm leading-relaxed">{q.aiFeedback}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-500 text-sm italic">Question skip kiya gaya</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/dashboard"
            className="flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 text-slate-300 py-3.5 rounded-2xl transition text-sm font-medium">
            <Home size={16} /> Dashboard
          </Link>
          <Link to="/interview/new"
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white py-3.5 rounded-2xl transition text-sm font-medium shadow-lg shadow-violet-500/20">
            <RotateCcw size={16} /> New Interview
          </Link>
        </div>
      </div>
    </div>
  );
}
