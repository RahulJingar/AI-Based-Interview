import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Send, Bot, User, Loader, Home } from 'lucide-react';

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! 👋 Main tumhara coding buddy hun. Koi bhi programming question pucho - simple language mein explain kar dunga!",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: input.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat/ask', { question: input.trim() });
      
      const botMessage = {
        id: Date.now() + 1,
        text: data.answer,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      toast.error('AI se connect nahi ho paya, try again');
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry bhai, kuch technical problem hai. Thoda baad try karo! 😅",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="text-violet-400" size={28} />
              AI Coding Assistant
            </h1>
            <p className="text-slate-400 text-sm">Kuch bhi pucho - simple explain kar dunga!</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-slate-400 hover:text-violet-400 transition"
          >
            <Home size={16} /> Dashboard
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-280px)]">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.isBot ? '' : 'flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.isBot ? 'bg-violet-600' : 'bg-emerald-600'
                }`}>
                  {message.isBot ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`max-w-[70%] ${message.isBot ? '' : 'text-right'}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.isBot 
                      ? 'bg-slate-700 text-slate-100' 
                      : 'bg-emerald-600 text-white'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-slate-700 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader className="animate-spin" size={16} />
                  <span className="text-slate-400">Typing...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t border-slate-600 p-4">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Koi bhi coding question pucho... (e.g., React mein useState kya hai?)"
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition flex items-center"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}