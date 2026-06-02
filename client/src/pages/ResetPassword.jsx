import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Lock, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      navigate('/login');
    }
  }, [token, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords match nahi kar rahe');
    }
    if (password.length < 6) {
      return toast.error('Password kamse kam 6 characters ka hona chahiye');
    }
    
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      toast.success('Password reset ho gaya!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kuch problem hai, try again');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">
          <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Password Reset! 🎉</h1>
          <p className="text-slate-400 mb-6">
            Tumhara password successfully change ho gaya hai. Ab login kar sakte ho.
          </p>
          <Link
            to="/login"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <Lock size={40} className="mx-auto text-violet-400 mb-3" />
          <h1 className="text-3xl font-bold text-white mb-2">New Password Set Karo 🔑</h1>
          <p className="text-slate-400">Strong password daalo bhai</p>
        </div>
        
        <form onSubmit={submit} className="space-y-4">
          <input
            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
            type="password" placeholder="New password (min 6 chars)" required minLength={6}
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
            type="password" placeholder="Confirm new password" required
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-red-400 text-sm">Passwords match nahi kar rahe</p>
          )}
          <button
            type="submit" disabled={loading || password !== confirmPassword}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <Link to="/login" className="text-violet-400 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}