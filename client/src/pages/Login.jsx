import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Brain, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Panel - hidden on mobile */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-violet-900/40 to-slate-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent" />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center">
              <Brain size={28} className="text-white" />
            </div>
            <span className="text-white text-2xl font-bold">InterviewAI</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            AI se interview<br />practice karo! 🚀
          </h2>
          <p className="text-slate-400 text-lg mb-8">Real AI questions, instant feedback, voice answers — sab ek jagah.</p>
          <div className="space-y-3">
            {['AI-generated mock questions', 'Voice to text answers', 'Instant AI feedback & scoring', 'Resume-based interviews'].map(f => (
              <div key={f} className="flex items-center gap-3 text-slate-300">
                <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="text-white text-xl font-bold">InterviewAI</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-1">Welcome back 👋</h1>
          <p className="text-slate-400 mb-8">Login karke practice shuru karo</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email</label>
              <input
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 focus:bg-slate-800/80 transition placeholder:text-slate-500"
                type="email" placeholder="apna@email.com" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-violet-500 transition placeholder:text-slate-500"
                  type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-violet-400 hover:text-violet-300">
                Password bhul gaye?
              </Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-slate-400 text-center mt-6 text-sm">
            Account nahi hai?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium">Register karo</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
