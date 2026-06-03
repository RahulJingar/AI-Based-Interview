import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Brain, ChevronRight, Plus, Clock } from 'lucide-react';

export default function History() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/interviews').then(({ data }) => setInterviews(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Interview History</h1>
            <p className="text-slate-400 text-sm mt-0.5">{interviews.length} total interviews</p>
          </div>
          <Link to="/interview/new"
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
            <Plus size={15} /> New
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain size={28} className="text-violet-400" />
            </div>
            <p className="text-white font-semibold mb-1">Koi interview nahi hua abhi</p>
            <p className="text-slate-400 text-sm mb-4">Pehla mock interview shuru karo!</p>
            <Link to="/interview/new"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition">
              <Plus size={15} /> Start Interview
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {interviews.map((i) => (
              <Link key={i.id}
                to={i.status === 'completed' ? `/interview/${i.id}/result` : `/interview/${i.id}`}
                className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-violet-500/50 transition-all group">
                <div className="w-11 h-11 bg-violet-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain size={20} className="text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{i.topic}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-slate-500 text-xs capitalize flex items-center gap-1">
                      <Clock size={11} /> {new Date(i.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500 text-xs capitalize">{i.difficulty}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500 text-xs">{i.questions.length} Qs</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      i.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>{i.status}</span>
                    {i.score != null && (
                      <p className={`text-sm font-bold mt-1 ${i.score >= 7 ? 'text-emerald-400' : i.score >= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                        {i.score}/10
                      </p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
