import { useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Upload, FileText, Sparkles } from 'lucide-react';

export default function Resume() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Select a PDF file');
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const { data } = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      toast.success('Resume analyzed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Resume Analysis</h1>
        <p className="text-slate-400 mb-8">Upload your resume and AI will suggest interview topics</p>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 mb-6">
          <form onSubmit={handleUpload} className="space-y-5">
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition ${
              file ? 'border-violet-500 bg-violet-500/10' : 'border-slate-600 hover:border-violet-500'
            }`}>
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              <FileText size={36} className={file ? 'text-violet-400' : 'text-slate-500'} />
              <p className="mt-3 text-sm text-slate-400">
                {file ? file.name : 'Click to upload PDF (max 5MB)'}
              </p>
            </label>
            <button type="submit" disabled={loading || !file}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50">
              <Upload size={16} />
              {loading ? 'Analyzing resume...' : 'Upload & Analyze'}
            </button>
          </form>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm mb-3">
                <Sparkles size={16} /> AI Summary
              </div>
              <p className="text-slate-300">{result.summary}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <p className="text-violet-400 font-semibold text-sm mb-4">Recommended Interview Topics</p>
              <div className="flex flex-wrap gap-3">
                {result.topics?.map((t) => (
                  <span key={t} className="px-4 py-2 bg-violet-600/20 border border-violet-500/30 text-violet-300 rounded-full text-sm">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
