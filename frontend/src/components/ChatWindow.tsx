import React, { useRef, useEffect } from 'react';
import { 
  Bot, 
  Trash2, 
  Sparkles, 
  GraduationCap, 
  FileText, 
  Briefcase, 
  Home, 
  BookOpen, 
  Building2, 
  CalendarCheck,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  onFeedback: (id: string, feedback: 'helpful' | 'unhelpful') => void;
  onBackToHome: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  activeCategory,
  onSelectCategory,
  onSendMessage,
  onClearChat,
  onFeedback,
  onBackToHome
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const categories = [
    { id: 'academics', label: 'Academics', icon: GraduationCap },
    { id: 'examinations', label: 'Examinations', icon: FileText },
    { id: 'placements', label: 'Placements', icon: Briefcase },
    { id: 'hostel', label: 'Hostel', icon: Home },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'administration', label: 'Administration', icon: Building2 },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'events', label: 'Events', icon: Sparkles }
  ];

  const suggestedQuestions = [
    { text: 'Whom should I contact for academic problems?', category: 'academics' },
    { text: 'Where can I find the examination timetable?', category: 'examinations' },
    { text: 'Whom should I contact for placement training?', category: 'placements' },
    { text: 'How can I raise a hostel complaint?', category: 'hostel' },
    { text: 'What is the exact date of my next examination?', category: 'examinations' },
    { text: 'What is the minimum attendance requirement?', category: 'attendance' }
  ];

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-100">
      {/* Left Sidebar (Desktop Navigation) */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          {/* Header Action */}
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-900 mb-6 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </button>

          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Categories
          </div>

          <div className="space-y-1">
            <button
              onClick={() => onSelectCategory(null)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeCategory === null
                  ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Bot className="w-4 h-4 text-amber-500" />
              All University Topics
            </button>

            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(isActive ? null : cat.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer: Clear Chat */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={onClearChat}
            disabled={messages.length === 0}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Conversation
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50">
        {/* Mobile Category Strip */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto p-2 bg-white border-b border-slate-200 scrollbar-none">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              activeCategory === null ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(activeCategory === cat.id ? null : cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                activeCategory === cat.id ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              /* Genuine Empty State (No fabricated user/assistant history) */
              <div className="py-12 sm:py-16 text-center max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0B1E3D] to-blue-900 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-xl border border-blue-800/40">
                  <Bot className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  How can CampusBuddy AI assist you?
                </h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                  Ask anything about academics, exam notifications, placements, hostel complaints, library resources, or administration.
                </p>

                <div className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  Suggested Questions:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSendMessage(q.text)}
                      className="bg-white hover:bg-blue-50/70 border border-slate-200/90 hover:border-blue-300 rounded-xl p-3 text-left transition shadow-xs text-xs font-medium text-slate-800 flex flex-col justify-between cursor-pointer"
                    >
                      <span>{q.text}</span>
                      <span className="text-[10px] text-blue-600 font-semibold uppercase mt-2">
                        {q.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onFeedback={onFeedback}
                />
              ))
            )}

            {/* Thinking / Typing Animation */}
            {isLoading && (
              <div className="flex justify-start mb-6 items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B1E3D] to-blue-900 text-amber-400 flex items-center justify-center shadow-md flex-shrink-0">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none px-5 py-4 border border-slate-200 shadow-sm flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="ml-2">Searching Presidency University knowledge base...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <ChatInput
          onSend={onSendMessage}
          isLoading={isLoading}
          activeCategory={activeCategory}
          onClearCategory={() => onSelectCategory(null)}
        />
      </main>
    </div>
  );
};
