import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Calendar, ChevronRight } from 'lucide-react';

export default function History() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/interviews').then(({ data }) => setInterviews(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Interview History</h1>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500"></div>
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-400">
            No interviews yet. <Link to="/interview/new" className="text-violet-400 hover:underline">Start one now!</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((i) => (
              <Link key={i.id} to={i.status === 'completed' ? `/interview/${i.id}/result` : `/interview/${i.id}`}
                className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-violet-500 transition">
                <div>
                  <p className="font-semibold">{i.topic}</p>
                  <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                    <Calendar size={12} />
                    {new Date(i.createdAt).toLocaleDateString()} • <span className="capitalize">{i.difficulty}</span> • {i.questions.length} questions
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      i.status === 'completed' ? 'bg-emerald-900 text-emerald-400' : 'bg-amber-900 text-amber-400'
                    }`}>{i.status}</span>
                    {i.score && <p className="text-white font-bold text-sm mt-1">{i.score}/10</p>}
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
