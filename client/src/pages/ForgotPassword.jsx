import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link bhej diya hai!');
      // Show token in development (remove in production)
      if (data.resetToken) {
        console.log('Reset Token:', data.resetToken);
        toast('Token console mein check karo (dev mode)', { icon: '🔧' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kuch problem hai, try again');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">
          <Mail size={48} className="mx-auto text-emerald-400 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Email Sent! ✉️</h1>
          <p className="text-slate-400 mb-6">
            Reset link bhej diya hai <span className="text-white">{email}</span> pe.
            Email check karo aur link pe click karo.
          </p>
          <p className="text-xs text-slate-500 mb-4">
            (Dev mode: Console mein token check karo)
          </p>
          <Link
            to="/login"
            className="inline-block bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">Password Bhul Gaye? 🤔</h1>
        <p className="text-slate-400 mb-8">Email daalo, reset link bhej denge</p>
        
        <form onSubmit={submit} className="space-y-4">
          <input
            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
            type="email" placeholder="Your email address" required
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit" disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className="text-center mt-6 space-y-2">
          <Link to="/login" className="block text-violet-400 hover:underline">
            Back to Login
          </Link>
          <Link to="/register" className="block text-slate-400 hover:text-violet-400 text-sm">
            No account? Register here
          </Link>
        </div>
      </div>
    </div>
  );
}