import React, { useState } from 'react';
import { Send, Sparkles, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onSearch: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  const samplePrompts = [
    'Whom should I contact for academic problems?',
    'Where can I find the examination timetable?',
    'Whom should I contact for placement training?',
    'How can I raise a hostel complaint?'
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1E3D] via-[#102A54] to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Banner Pill */}
        <div className="inline-flex items-center gap-2 bg-blue-900/60 border border-blue-700/60 px-3.5 py-1.5 rounded-full text-xs text-blue-200 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>TECHNOPIA 2.0 AI Campus Helpdesk • Powered by Grounded RAG</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">Presidency University</span> Campus Helpdesk!
        </h1>
        <p className="text-base sm:text-lg text-blue-100/90 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Your smart assistant for university queries. Instant answers grounded in official academic, examination, placement, and campus information.
        </p>

        {/* Prominent Search Bar */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 shadow-2xl border border-white/20 max-w-3xl mx-auto text-slate-800">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask your question (e.g., academic problems, exam timetable, hostel complaint)..."
              className="flex-1 px-4 py-3 text-sm sm:text-base outline-none bg-transparent placeholder-slate-400 text-slate-900"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="bg-[#0B1E3D] hover:bg-blue-900 disabled:opacity-50 text-white font-medium px-5 py-3 rounded-xl flex items-center gap-2 text-sm transition-all shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Ask Helpdesk</span>
              <Send className="w-4 h-4 text-amber-400" />
            </button>
          </form>
        </div>

        {/* Sample Question Chips */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-blue-200 font-medium mr-1 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Try asking:
          </span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSearch(prompt)}
              className="bg-blue-950/60 hover:bg-blue-900/80 text-blue-100 border border-blue-800/80 rounded-lg px-3 py-1.5 transition text-left cursor-pointer hover:border-amber-400/50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Factual Grounding Notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-blue-200/70">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Responses strictly grounded in verified university knowledge base. No fabricated dates or regulations.</span>
        </div>
      </div>
    </section>
  );
};
