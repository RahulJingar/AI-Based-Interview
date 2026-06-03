import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import {
  Brain,
  TrendingUp,
  Clock,
  Plus,
  MessageCircle,
  Upload,
  ChevronRight,
  Zap,
  Minus,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, completed: 0, avgScore: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get("/interviews").then(({ data }) => {
      const completed = data.filter((i) => i.status === "completed");
      const avgScore = completed.length
        ? (
            completed.reduce((a, b) => a + (b.score || 0), 0) / completed.length
          ).toFixed(1)
        : 0;
      setStats({ total: data.length, completed: completed.length, avgScore });
      setRecent(data.slice(0, 5));
    });
  }, []);

  const quickActions = [
    {
      to: "/interview/new",
      icon: Minus,
      label: "New Interview old wala bhi dikhao",
      desc: "Start mock interview",
      color: "from-violet-600 to-violet-700",
      shadow: "shadow-violet-500/20",
    },
    {
      to: "/ai-chat",
      icon: MessageCircle,
      label: "AI Chat",
      desc: "Ask anything",
      color: "from-emerald-600 to-emerald-700",
      shadow: "shadow-emerald-500/20",
    },
    {
      to: "/history",
      icon: Clock,
      label: "Histor",
      desc: "Past interviews",
      color: "from-amber-600 to-amber-700",
      shadow: "shadow-amber-500/20",
    },
    {
      to: "/resume",
      icon: Upload,
      label: "Resume",
      desc: "Upload & analyze",
      color: "from-blue-600 to-blue-700",
      shadow: "shadow-blue-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            Hey, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-400">Aaj kaunsa topic practice karna hai?</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {[
            {
              icon: Brain,
              label: "Total",
              value: stats.total,
              color: "text-violet-400",
              bg: "bg-violet-500/10",
            },
            {
              icon: Clock,
              label: "Completed",
              value: stats.completed,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
            },
            {
              icon: TrendingUp,
              label: "Avg Score",
              value: `${stats.avgScore}/10`,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5"
            >
              <div
                className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}
              >
                <s.icon size={18} className={s.color} />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-white">
                {s.value}
              </p>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap size={18} className="text-yellow-400" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {quickActions.map(
            ({ to, icon: Icon, label, desc, color, shadow }) => (
              <Link
                key={to}
                to={to}
                className={` ${color} ${shadow} shadow-lg p-4 sm:p-5 rounded-2xl hover:opacity-90 hover:scale-[1.02] transition-all active:scale-[0.98]`}
              >
                <Icon size={22} className="mb-3 text-white/90" />
                <p className="font-semibold text-white text-sm sm:text-base">
                  {label}
                </p>
                <p className="text-white/70 text-xs mt-0.5 hidden sm:block">
                  {desc}
                </p>
              </Link>
            ),
          )}
        </div>

        {/* Recent Interviews */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Interviews</h2>
          <Link
            to="/history"
            className="text-violet-400 hover:text-violet-300 text-sm"
          >
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 sm:p-14 text-center">
            <div className="w-16 h-16 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain size={28} className="text-violet-400" />
            </div>
            <p className="text-white font-semibold mb-1">
              Koi interview nahi hua abhi
            </p>
            <p className="text-slate-400 text-sm mb-4">
              Apna pehla mock interview shuru karo!
            </p>
            <Link
              to="/interview/new"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
            >
              <Plus size={16} /> Start Interview
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recent.map((i) => (
              <Link
                key={i.id}
                to={
                  i.status === "completed"
                    ? `/interview/${i.id}/result`
                    : `/interview/${i.id}`
                }
                className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-violet-500/50 hover:bg-slate-900/80 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                    <Brain size={18} className="text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">
                      {i.topic}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5 capitalize">
                      {i.difficulty} •{" "}
                      {new Date(i.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        i.status === "completed"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {i.status}
                    </span>
                    {i.score != null && (
                      <p className="text-white font-bold text-sm mt-1">
                        {i.score}/10
                      </p>
                    )}
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-600 group-hover:text-slate-400 transition"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
