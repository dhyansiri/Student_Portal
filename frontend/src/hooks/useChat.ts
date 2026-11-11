import { useState, useCallback } from 'react';
import { ChatMessage, SourceCitation } from '../types';
import { sendChatMessage } from '../services/chatApi';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string, categoryOverride?: string) => {
    const cleanText = text.trim();
    if (!cleanText || isLoading) return;

    setError(null);
    const categoryToSend = categoryOverride || activeCategory || undefined;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: categoryToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build conversation history from previous turns
      const history = messages.slice(-4).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await sendChatMessage(cleanText, history, categoryToSend);

      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: res.reply || 'No response received from helpdesk engine.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: res.category || categoryToSend,
        grounded: res.grounded,
        sources: res.sources,
        engine: res.engine
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('[Chat Error]', err);
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: err.message || 'Unable to reach the campus helpdesk server. Please check backend connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        grounded: false
      };
      setMessages(prev => [...prev, errMsg]);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, activeCategory]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const setFeedback = useCallback((messageId: string, feedback: 'helpful' | 'unhelpful') => {
    setMessages(prev =>
      prev.map(m => (m.id === messageId ? { ...m, feedback } : m))
    );
  }, []);

  return {
    messages,
    isLoading,
    error,
    activeCategory,
    setActiveCategory,
    sendMessage,
    clearChat,
    setFeedback
  };
}
