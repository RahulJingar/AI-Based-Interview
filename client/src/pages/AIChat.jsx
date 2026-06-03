import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MessageRenderer from '../components/MessageRenderer';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Send, Bot, User, Loader, Trash2 } from 'lucide-react';

const SUGGESTED = [
  'React mein useState kaise kaam karta hai?',
  'Event loop kya hota hai JavaScript mein?',
  'REST API aur GraphQL ka difference?',
  'Git merge aur rebase mein kya fark hai?',
];

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! 👋 Main tumhara coding buddy hun.\n\nKoi bhi programming concept pucho — simple Hinglish mein samjha dunga, diagram ke saath! 🎯",
      isBot: true,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    const userMsg = { id: Date.now(), text: question, isBot: false };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Build history — exclude the initial greeting, last 10 messages
      const history = newMessages
        .slice(1, -1) // skip first greeting
        .slice(-10)
        .map((m) => ({ role: m.isBot ? 'assistant' : 'user', content: m.text }));

      const { data } = await api.post('/chat/ask', { question, history });

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: data.answer, isBot: true },
      ]);
    } catch {
      toast.error('AI se connect nahi hua, try again');
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: 'Sorry bhai, kuch problem aa gayi. Dobara try karo! 😅', isBot: true },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      text: "Hey! 👋 Main tumhara coding buddy hun.\n\nKoi bhi programming concept pucho — simple Hinglish mein samjha dunga, diagram ke saath! 🎯",
      isBot: true,
    }]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col px-4 py-4" style={{ height: 'calc(100vh - 64px)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base">AI Coding Buddy</h1>
              <p className="text-emerald-400 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" /> Online
              </p>
            </div>
          </div>
          <button onClick={clearChat}
            className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-800 transition">
            <Trash2 size={14} /> Clear
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.isBot ? '' : 'flex-row-reverse'}`}>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.isBot ? 'bg-emerald-600' : 'bg-violet-600'
              }`}>
                {msg.isBot ? <Bot size={14} /> : <User size={14} />}
              </div>
              <div className={`max-w-[85%] sm:max-w-[78%] ${msg.isBot ? '' : 'items-end flex flex-col'}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  msg.isBot
                    ? 'bg-slate-800 border border-slate-700 rounded-tl-sm'
                    : 'bg-violet-600 rounded-tr-sm'
                }`}>
                  {msg.isBot
                    ? <MessageRenderer text={msg.text} msgId={msg.id} />
                    : <p className="text-sm">{msg.text}</p>
                  }
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={14} />
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader size={14} className="animate-spin text-emerald-400" />
                  <span className="text-slate-400 text-sm">Soch raha hun...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions — only show when just greeting */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTED.map((s) => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-xs bg-slate-800 border border-slate-700 text-slate-300 hover:border-violet-500 hover:text-violet-300 px-3 py-2 rounded-xl transition">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3 flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
            placeholder="Koi bhi coding concept pucho... (Enter to send)"
            className="flex-1 bg-transparent text-white text-sm focus:outline-none resize-none max-h-32 placeholder:text-slate-500"
            rows={1}
            disabled={loading}
            style={{ minHeight: '24px' }}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition flex-shrink-0">
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-slate-600 text-xs mt-2">Enter to send • Shift+Enter for new line</p>
      </div>
    </div>
  );
}
