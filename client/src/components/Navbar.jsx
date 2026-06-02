import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Brain, History, Upload, Plus } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
      <Link to="/dashboard" className="flex items-center gap-2 text-violet-400 font-bold text-xl">
        <Brain size={24} /> InterviewAI
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/interview/new" className="flex items-center gap-1 text-slate-300 hover:text-violet-400 transition text-sm">
          <Plus size={16} /> New Interview
        </Link>
        <Link to="/history" className="flex items-center gap-1 text-slate-300 hover:text-violet-400 transition text-sm">
          <History size={16} /> History
        </Link>
        <Link to="/resume" className="flex items-center gap-1 text-slate-300 hover:text-violet-400 transition text-sm">
          <Upload size={16} /> Resume
        </Link>
        <span className="text-slate-400 text-sm">{user?.name}</span>
        <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
