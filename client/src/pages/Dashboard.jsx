import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Brain, TrendingUp, Clock, Plus } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, completed: 0, avgScore: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get('/interviews').then(({ data }) => {
      const completed = data.filter((i) => i.status === 'completed');
      const avgScore = completed.length
        ? (completed.reduce((a, b) => a + (b.score || 0), 0) / completed.length).toFixed(1)
        : 0;
      setStats({ total: data.length, completed: completed.length, avgScore });
      setRecent(data.slice(0, 3));
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-1">Hello, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-400 mb-8">Ready for your next mock interview?</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: <Brain size={22} />, label: 'Total Interviews', value: stats.total, color: 'violet' },
            { icon: <Clock size={22} />, label: 'Completed', value: stats.completed, color: 'emerald' },
            { icon: <TrendingUp size={22} />, label: 'Avg Score', value: `${stats.avgScore}/10`, color: 'amber' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
              <div className={`text-${s.color}-400`}>{s.icon}</div>
              <div>
                <p className="text-slate-400 text-sm">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Interviews</h2>
          <Link to="/interview/new"
            className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm transition">
            <Plus size={16} /> Start New
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 text-center text-slate-400">
            No interviews yet. Start your first mock interview!
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((i) => (
              <Link key={i.id} to={`/interview/${i.id}`}
                className="block bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-violet-500 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{i.topic}</p>
                    <p className="text-slate-400 text-sm">{i.difficulty} • {new Date(i.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      i.status === 'completed' ? 'bg-emerald-900 text-emerald-400' : 'bg-amber-900 text-amber-400'
                    }`}>
                      {i.status}
                    </span>
                    {i.score && <p className="text-white font-bold mt-1">{i.score}/10</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
