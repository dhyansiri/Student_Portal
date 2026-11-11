import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { ChatWindow } from './components/ChatWindow';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { useChat } from './hooks/useChat';
import { StudentProfile } from './types';
import { localAuth, supabase, isSupabaseConfigured } from './services/supabaseClient';

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'login' | 'register' | 'dashboard'>('home');
  const [currentUser, setCurrentUser] = useState<StudentProfile | null>(null);

  const {
    messages,
    isLoading,
    activeCategory,
    setActiveCategory,
    sendMessage,
    clearChat,
    setFeedback
  } = useChat();

  // Restore authenticated session on mount
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile: StudentProfile = {
            id: session.user.id,
            full_name: session.user.user_metadata?.full_name || 'Presidency Student',
            email: session.user.email || '',
            usn: session.user.user_metadata?.usn
          };
          setCurrentUser(profile);
          localAuth.setUser(profile);
        } else {
          setCurrentUser(localAuth.getUser());
        }
      });
    } else {
      setCurrentUser(localAuth.getUser());
    }
  }, []);

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    localAuth.clearUser();
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handleSearchFromHome = (query: string) => {
    setCurrentView('chat');
    sendMessage(query);
  };

  const handleSelectCategoryFromHome = (categoryId: string, starterQuery?: string) => {
    setActiveCategory(categoryId);
    setCurrentView('chat');
    if (starterQuery) {
      sendMessage(starterQuery, categoryId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Top Header with official logo preservation */}
      <Header
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as any)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <Home
            onSearch={handleSearchFromHome}
            onSelectCategory={handleSelectCategoryFromHome}
          />
        )}

        {currentView === 'chat' && (
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onSendMessage={sendMessage}
            onClearChat={clearChat}
            onFeedback={setFeedback}
            onBackToHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'login' && (
          <Login
            onSuccess={(user) => {
              setCurrentUser(user);
              setCurrentView('dashboard');
            }}
            onNavigate={(view) => setCurrentView(view as any)}
          />
        )}

        {currentView === 'register' && (
          <Register
            onSuccess={(user) => {
              setCurrentUser(user);
              setCurrentView('dashboard');
            }}
            onNavigate={(view) => setCurrentView(view as any)}
          />
        )}

        {currentView === 'dashboard' && currentUser && (
          <Dashboard
            user={currentUser}
            onNavigateToChat={(catId, query) => {
              if (catId) setActiveCategory(catId);
              setCurrentView('chat');
              if (query) sendMessage(query, catId);
            }}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
  );
}

export default App;
