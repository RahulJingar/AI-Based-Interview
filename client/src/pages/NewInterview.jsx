import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Sparkles, ChevronRight } from 'lucide-react';

const TOPICS = ['React', 'Node.js', 'JavaScript', 'Python', 'Java', 'SQL', 'System Design', 'DSA', 'TypeScript', 'AWS'];
const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', desc: 'Basic concepts', color: 'emerald' },
  { value: 'medium', label: 'Medium', desc: 'Practical', color: 'amber' },
  { value: 'hard', label: 'Hard', desc: 'Advanced', color: 'red' },
];

export default function NewInterview() {
  const [form, setForm] = useState({ topic: '', difficulty: 'medium', count: 5 });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const start = async (e) => {
    e.preventDefault();
    if (!form.topic.trim()) return toast.error('Topic select ya type karo');
    setLoading(true);
    try {
      const { data } = await api.post('/interviews/start', form);
      navigate(`/interview/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Interview start nahi hua');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">New Mock Interview</h1>
          <p className="text-slate-400">AI tumhare liye questions banayega</p>
        </div>

        <form onSubmit={start} className="space-y-6">
          {/* Topic */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <label className="block text-sm font-medium text-slate-300 mb-3">Topic kya hai?</label>
            <input
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 transition placeholder:text-slate-500 mb-3"
              placeholder="e.g. React Hooks, System Design, DSA..."
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
            />
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button key={t} type="button"
                  onClick={() => setForm({ ...form, topic: t })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                    form.topic === t
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'border-slate-700 text-slate-400 hover:border-violet-500 hover:text-violet-400 bg-slate-800/50'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <label className="block text-sm font-medium text-slate-300 mb-3">Difficulty level</label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map((d) => (
                <button key={d.value} type="button"
                  onClick={() => setForm({ ...form, difficulty: d.value })}
                  className={`p-3 rounded-xl border-2 text-center transition ${
                    form.difficulty === d.value
                      ? `border-${d.color}-500 bg-${d.color}-500/10`
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                  }`}>
                  <p className={`font-semibold text-sm ${form.difficulty === d.value ? `text-${d.color}-400` : 'text-slate-300'}`}>
                    {d.label}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-300">Questions kitne?</label>
              <span className="text-violet-400 font-bold text-lg">{form.count}</span>
            </div>
            <input type="range" min={3} max={10} value={form.count}
              onChange={(e) => setForm({ ...form, count: +e.target.value })}
              className="w-full accent-violet-500 h-2"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>3</span><span>10</span>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-4 rounded-2xl transition disabled:opacity-50 text-base shadow-lg shadow-violet-500/20">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI questions bana raha hai...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Interview Start Karo
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
