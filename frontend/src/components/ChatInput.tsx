import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  activeCategory: string | null;
  onClearCategory: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading,
  activeCategory,
  onClearCategory
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <div className="border-t border-slate-200/80 bg-white/95 backdrop-blur-md p-4 sticky bottom-0 z-20">
      <div className="max-w-4xl mx-auto">
        {/* Active Category Filter Indicator */}
        {activeCategory && (
          <div className="mb-2 flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-900 px-3 py-1.5 rounded-lg text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Filtering in Category: <strong className="uppercase">{activeCategory}</strong></span>
            </div>
            <button
              onClick={onClearCategory}
              className="text-blue-700 hover:text-blue-900 flex items-center gap-1 text-[11px] font-semibold"
            >
              Clear filter <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              activeCategory
                ? `Ask about ${activeCategory}...`
                : "Ask your Presidency University question (e.g., academic problems, next exam, hostel, placements)..."
            }
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none transition disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="bg-[#0B1E3D] hover:bg-blue-900 disabled:opacity-50 text-white font-medium px-5 py-3 rounded-xl flex items-center gap-2 text-sm transition-all shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
          >
            <span className="hidden sm:inline">Send</span>
            <Send className="w-4 h-4 text-amber-400" />
          </button>
        </form>

        <div className="text-[11px] text-slate-400 mt-2 text-center">
          CampusBuddy AI is grounded in official Presidency University sample guidelines.
        </div>
      </div>
    </div>
  );
};
