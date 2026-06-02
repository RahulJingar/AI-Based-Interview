import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';

const TOPICS = ['React', 'Node.js', 'JavaScript', 'Python', 'Java', 'SQL', 'System Design', 'DSA', 'TypeScript', 'AWS'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function NewInterview() {
  const [form, setForm] = useState({ topic: '', difficulty: 'medium', count: 5 });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const start = async (e) => {
    e.preventDefault();
    if (!form.topic.trim()) return toast.error('Please enter or select a topic');
    setLoading(true);
    try {
      const { data } = await api.post('/interviews/start', form);
      navigate(`/interview/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start interview');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Start Mock Interview</h1>
        <p className="text-slate-400 mb-8">AI will generate questions tailored to your topic</p>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <form onSubmit={start} className="space-y-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Topic</label>
              <input
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                placeholder="e.g. React Hooks, System Design..."
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {TOPICS.map((t) => (
                  <button key={t} type="button"
                    onClick={() => setForm({ ...form, topic: t })}
                    className={`px-3 py-1 rounded-full text-xs border transition ${
                      form.topic === t
                        ? 'bg-violet-600 border-violet-600 text-white'
                        : 'border-slate-600 text-slate-400 hover:border-violet-500'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Difficulty</label>
              <div className="flex gap-3">
                {DIFFICULTIES.map((d) => (
                  <button key={d} type="button"
                    onClick={() => setForm({ ...form, difficulty: d })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition capitalize ${
                      form.difficulty === d
                        ? 'bg-violet-600 border-violet-600 text-white'
                        : 'border-slate-600 text-slate-400 hover:border-violet-500'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Number of Questions: {form.count}</label>
              <input type="range" min={3} max={10} value={form.count}
                onChange={(e) => setForm({ ...form, count: +e.target.value })}
                className="w-full accent-violet-500"
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
              <Sparkles size={18} />
              {loading ? 'Generating questions...' : 'Start Interview'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
