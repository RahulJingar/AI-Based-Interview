import { useLocation, useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Trophy, RotateCcw, Home } from 'lucide-react';

export default function InterviewResult() {
  const { state } = useLocation();
  const { id } = useParams();
  const [interview, setInterview] = useState(state?.interview || null);

  useEffect(() => {
    if (!interview) {
      api.get(`/interviews/${id}`).then(({ data }) => setInterview(data));
    }
  }, [id]);

  if (!interview) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500"></div>
    </div>
  );

  const scoreColor = interview.score >= 7 ? 'text-emerald-400' : interview.score >= 5 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <Trophy size={48} className="mx-auto text-amber-400 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Interview Complete!</h1>
          <p className="text-slate-400">{interview.topic} • <span className="capitalize">{interview.difficulty}</span></p>
          <div className={`text-6xl font-bold mt-6 ${scoreColor}`}>{interview.score}<span className="text-2xl text-slate-400">/10</span></div>
        </div>

        {interview.feedback && (
          <div className="bg-slate-800 border border-violet-700 rounded-2xl p-6 mb-8">
            <p className="text-violet-400 font-semibold text-sm mb-2">AI Overall Feedback</p>
            <p className="text-slate-300 leading-relaxed">{interview.feedback}</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          {interview.questions.map((q, i) => (
            <div key={q.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="text-slate-400 text-sm">Q{i + 1}</p>
                <span className={`text-sm font-bold ${q.score >= 7 ? 'text-emerald-400' : q.score >= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                  {q.score ?? '—'}/10
                </span>
              </div>
              <p className="text-white font-medium mb-2">{q.question}</p>
              {q.userAnswer && (
                <>
                  <p className="text-slate-400 text-sm mb-1"><span className="text-slate-500">Answer: </span>{q.userAnswer}</p>
                  <p className="text-slate-400 text-sm"><span className="text-slate-500">Feedback: </span>{q.aiFeedback}</p>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Link to="/dashboard" className="flex-1 flex items-center justify-center gap-2 border border-slate-600 text-slate-300 hover:border-violet-500 py-3 rounded-xl transition">
            <Home size={16} /> Dashboard
          </Link>
          <Link to="/interview/new" className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl transition">
            <RotateCcw size={16} /> New Interview
          </Link>
        </div>
      </div>
    </div>
  );
}
