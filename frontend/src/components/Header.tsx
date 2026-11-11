import React from 'react';
import { User, LogIn, LogOut, Bot, Sparkles } from 'lucide-react';
import { StudentProfile } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: StudentProfile | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onLogout
}) => {
  return (
    <header className="bg-[#0B1E3D] text-white shadow-md border-b border-blue-950/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Presidency Logo & Campus Helpdesk branding */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-4 cursor-pointer select-none group"
        >
          <div className="h-14 w-auto flex items-center">
            <img
              src="/assets/presidency-logo.svg"
              alt="Presidency University Logo"
              className="h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </div>
          <div className="hidden sm:block border-l border-blue-800/80 pl-4">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">AI Campus Helpdesk</span>
              <span className="bg-amber-400 text-blue-950 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">2.0</span>
            </div>
            <p className="text-xs text-blue-200/80 font-medium tracking-wide">Ask • Learn • Get Help</p>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'home'
                ? 'bg-blue-800/90 text-white shadow-sm'
                : 'text-blue-100/90 hover:bg-blue-900/60 hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('chat')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'chat'
                ? 'bg-blue-800/90 text-white shadow-sm'
                : 'text-blue-100/90 hover:bg-blue-900/60 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-400" />
            AI Helpdesk
          </button>
          {currentUser && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-800/90 text-white shadow-sm'
                  : 'text-blue-100/90 hover:bg-blue-900/60 hover:text-white'
              }`}
            >
              Dashboard
            </button>
          )}
        </nav>

        {/* Right: Student Profile & Authentication */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div 
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2.5 bg-blue-900/60 hover:bg-blue-800/80 px-3 py-1.5 rounded-lg cursor-pointer transition border border-blue-700/50"
              >
                <div className="w-8 h-8 rounded-full bg-amber-400 text-blue-950 font-bold flex items-center justify-center text-xs shadow-inner">
                  {currentUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-semibold leading-tight text-white">{currentUser.full_name}</div>
                  <div className="text-[10px] text-blue-200/80">{currentUser.usn || 'Student'}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Log Out"
                className="p-2 text-blue-200 hover:text-rose-300 hover:bg-blue-900/50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-100 hover:text-white px-3 py-1.5 rounded-lg hover:bg-blue-900/60 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-blue-950 px-3.5 py-1.5 rounded-lg transition shadow-sm"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
