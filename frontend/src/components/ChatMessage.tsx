import React from 'react';
import { ThumbsUp, ThumbsDown, Bot, User, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  onFeedback: (id: string, feedback: 'helpful' | 'unhelpful') => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onFeedback }) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 items-end gap-2">
        <div className="max-w-[85%] sm:max-w-xl">
          <div className="bg-[#0B1E3D] text-white px-4 py-3 rounded-2xl rounded-br-none shadow-md text-sm leading-relaxed">
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
          <div className="text-[10px] text-slate-400 text-right mt-1 px-1">
            {message.timestamp}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center text-xs font-semibold shadow-xs flex-shrink-0">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6 items-start gap-3">
      {/* Assistant Avatar */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B1E3D] to-blue-900 text-amber-400 flex items-center justify-center shadow-md flex-shrink-0 border border-blue-800/50 mt-1">
        <Bot className="w-5 h-5" />
      </div>

      <div className="max-w-[90%] sm:max-w-2xl">
        <div className="bg-white rounded-2xl rounded-tl-none p-4 sm:p-5 border border-slate-200/90 shadow-sm text-sm text-slate-800 leading-relaxed">
          {/* Engine Header / Category Tag */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <span>CampusBuddy AI</span>
              {message.grounded ? (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Grounded in Campus Data
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-medium border border-amber-200">
                  <AlertCircle className="w-3 h-3 text-amber-600" /> Conversational
                </span>
              )}
            </div>

            {message.category && message.category !== 'general' && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {message.category}
              </span>
            )}
          </div>

          {/* Main Answer Text */}
          <div className="whitespace-pre-wrap text-slate-800 text-sm sm:text-base font-normal">
            {message.text}
          </div>

          {/* Grounded Sources Cards */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Verified Sources:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {message.sources.map((src, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-xs hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="font-semibold text-slate-900 line-clamp-1">{src.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{src.source}</div>
                    <div className="text-[9px] font-mono text-blue-700 mt-1 uppercase">{src.id}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer: Timestamp, Engine, and Feedback */}
        <div className="flex items-center justify-between mt-2 px-1 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>{message.timestamp}</span>
            {message.engine && <span>• {message.engine}</span>}
          </div>

          {/* Helpful / Not Helpful Feedback buttons */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Helpful?</span>
            <button
              onClick={() => onFeedback(message.id, 'helpful')}
              title="Helpful"
              className={`p-1.5 rounded-md transition ${
                message.feedback === 'helpful'
                  ? 'bg-emerald-100 text-emerald-700 font-bold'
                  : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onFeedback(message.id, 'unhelpful')}
              title="Not helpful"
              className={`p-1.5 rounded-md transition ${
                message.feedback === 'unhelpful'
                  ? 'bg-rose-100 text-rose-700 font-bold'
                  : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
