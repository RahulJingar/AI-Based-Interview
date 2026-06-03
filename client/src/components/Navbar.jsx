import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Brain, History, Upload, Plus, MessageCircle, Menu, X } from 'lucide-react';

const navLinks = [
  { to: '/interview/new', label: 'New Interview', icon: Plus },
  { to: '/ai-chat', label: 'AI Chat', icon: MessageCircle },
  { to: '/history', label: 'History', icon: History },
  { to: '/resume', label: 'Resume', icon: Upload },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-slate-900/95 backdrop-blur border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-violet-400 font-bold text-xl">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <span className="hidden sm:block">InterviewAI</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                location.pathname === to
                  ? 'bg-violet-600/20 text-violet-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}>
              <Icon size={15} /> {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg">
            <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-slate-300 text-sm font-medium">{user?.name?.split(' ')[0]}</span>
          </div>
          <button onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition">
            <LogOut size={18} />
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-700/50 bg-slate-900 px-4 py-3 space-y-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${
                location.pathname === to
                  ? 'bg-violet-600/20 text-violet-400'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}>
              <Icon size={18} /> {label}
            </Link>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 mt-2">
            <span className="text-slate-400 text-sm px-3">{user?.name}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 text-sm px-3 py-2">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
